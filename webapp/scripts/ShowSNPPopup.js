define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup, Controls, DataFetchers, MetaData) {


        var ShowSNPPopup = {}


        ShowSNPPopup.createPopup = function (data) {
            var snpid = data['snpid'];
            var content = '<div style="max-height:700px;max-width:900px;overflow-x:auto">';

            $.each(MetaData.countryPropertyGroups, function (idx0, propgroup) {
                content += '<table class="DQXStyledTable">';

                content += "<tr>";
                content += "<th>";
                content += 'Country';
                content += "</th>";
                $.each(propgroup, function (idx1, prop) {
                    content += "<th>";
                    content += prop;
                    content += "</th>";
                });
                content += "</tr>";

                $.each(MetaData.countries, function (idx1, country) {
                    content += "<tr>";
                    content += "<td>";
                    content += '<b>' + country + '</b>';
                    content += "</td>";
                    $.each(propgroup, function (idx2, prop) {
                        colid = country + ':' + prop;
                        content += "<td>";
                        var st = data[colid];
                        content += st;
                        content += "</td>";
                        delete data[colid];
                    });
                    content += "</tr>";
                });
                content += "</table><p/>";
            });

            content += DQX.CreateKeyValueTable(data);

            content += '</div>';

            var popupID = Popup.create("SNP " + snpid, content);

        }


        ShowSNPPopup.handlePopup = function (snpid) {
            var dataFetcher = ShowSNPPopup.dataFetcherSNPDetails;
            dataFetcher.fetchFullRecordInfo(
                SQL.WhereClause.CompareFixed('snpid', '=', snpid),
                function (data) {
                    DQX.stopProcessing();
                    ShowSNPPopup.createPopup(data);
                },
                function (msg) {
                    DQX.stopProcessing();
                    alert('Invalid SNP id: ' + snpid);
                }
                );
            DQX.setProcessing("Downloading...");
        }

        ShowSNPPopup.init = function () {
            ShowSNPPopup.dataFetcherSNPDetails = new DataFetchers.Curve(serverUrl, MetaData.database, MetaData.tableSNPDetails, 'pos');

            //Create event listener for actions to open a SNP popup window
            Msg.listen('', { type: 'ShowSNPPopup' }, function (context, snpid) {
                ShowSNPPopup.handlePopup(snpid);
            });
        }

        return ShowSNPPopup;
    });