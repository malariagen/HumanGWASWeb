define([DQXSC("Utils"), DQXSC("SQL"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (DQX, SQL, DataFetcher, MetaData) {
        var MetaDataDynamic = {};

        MetaDataDynamic.tryBuildMetaDataStructures = function (onCompletedHandler) {
            //wait until all data has been fetched
            var fetchCompleted = true;
            $.each(MetaDataDynamic.fetchedTables, function (ID) {
                if (!MetaDataDynamic[ID])
                    fetchCompleted = false;
            });
            if (!fetchCompleted)
                return;

            //structure the data plot values
            this.genomePlotValues = [];
            for (var i = 0; i < this._dataPlotValues.column_name.length; i++) {
                var Item = {
                    id: this._dataPlotValues.column_name[i],
                    name: this._dataPlotValues.name[i].replace(/\//g, "; "),
                    defaultVisible: parseInt(this._dataPlotValues.display_in_browser_by_default[i])>0
                };
                this.genomePlotValues.push(Item);
            }

            onCompletedHandler();
        }

        MetaDataDynamic.handleFetchError = function (msg) {
//            DQX.stopProcessing();
            if (!MetaDataDynamic.fetchErrorReported) {
                MetaDataDynamic.fetchErrorReported = true;
                alert('ERROR: failed to fetch data from the server: ' + msg);
            }
        }


        MetaDataDynamic.fetch = function (onCompletedHandler) {

            MetaDataDynamic.fetchedTables = {};

            MetaDataDynamic.fetchedTables['_dataPlotValues'] = {
                tableName: MetaData.tablePlotValuesInfo,
                columns: [{ name: "column_name" }, { name: "variable_id", encoding: "IN" }, { name: "name" }, { name: "visible_in_browser" }, { name: "display_in_browser_by_default"}],
                sortColumn: "-"
            };



            //Perform all the data fetching
            $.each(MetaDataDynamic.fetchedTables, function (ID, tableInfo) {
                var fetcher = DataFetcher.RecordsetFetcher(serverUrl, MetaData.database, tableInfo.tableName);
                $.each(tableInfo.columns, function (colidx, columnInfo) {
                    var encoding = columnInfo.encoding;
                    if (!encoding) encoding = 'ST';
                    fetcher.addColumn(columnInfo.name, encoding);
                });
                fetcher.getData(SQL.WhereClause.Trivial(), tableInfo.sortColumn, function (data) {
                    MetaDataDynamic[ID] = data;
//                    DQX.stopProcessing();
                    MetaDataDynamic.tryBuildMetaDataStructures(onCompletedHandler);
                },
                            MetaDataDynamic.handleFetchError
                        );
//                DQX.setProcessing("Downloading...");
            });
        }

        return MetaDataDynamic;
    });