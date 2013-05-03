define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup, Controls, DataFetchers, MetaData) {


        var ShowSNPPopup = {}

        ShowSNPPopup.createPopup = function (data) {
            var snpid = data['snpid'];
            var content = '<div style="max-height:600px">';

            content += '<table class="DQXStyledTable">';

            content += "<tr>";
            content += "<th>";
            content += '.';
            content += "</th>";
            $.each(MetaData.countries, function (idx1, country) {
                content += "<th>";
                content += country;
                content += "</th>";
            });
            content += "</tr>";

            $.each(MetaData.countryProperties, function (idx2, prop) {
                content += "<tr>";
                content += "<td>";
                content += prop;
                content += "</td>";
                $.each(MetaData.countries, function (idx1, country) {
                    colid = country + ':' + prop;
                    content += "<td>";
                    var st = data[colid];
                    content += parseFloat(st).toFixed(5);
                    content += "</td>";
                    delete data[colid];
                });
                content += "</tr>";
            });
            content += "</table>";

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