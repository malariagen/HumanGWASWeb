define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup, Controls, DataFetchers, MetaData) {


        var ShowSNPPopup = {}

        var renderValueBar = function (val, frac, fracColor) {
            var frac = Math.min(1, frac);
            return '<div style="background-color:{fracColor};height:100%;width:{prc}%">'.DQXformat({ prc: 100 * frac, fracColor: fracColor }) + val + '<div>';

        }


        ShowSNPPopup.createPopup = function (data) {
            var snpid = data['snpid'];
            var content = '<div style="max-height:700px;max-width:900px;overflow-x:auto">';

            $.each(MetaData.countryPropertyGroups, function (idx0, propgroup) {
                content += '<table class="DQXStyledTable" style="background-color:white;border:1px solid black">';

                content += "<tr>";
                content += "<th>";
                content += 'Country';
                content += "</th>";
                $.each(propgroup, function (idx1, prop) {
                    content += "<th>";
                    content += prop.id;
                    content += "</th>";
                });
                content += "</tr>";

                $.each(MetaData.countries, function (idx1, country) {
                    var dataCountry = {};
                    $.each(data, function (key, val) {
                        if (key.split(':')[0] == country) {
                            dataCountry[key.split(':')[1]] = val;
                        }
                    });

                    dataCountry.cases_TOT = parseFloat(dataCountry.cases_AA) + parseFloat(dataCountry.controls_AA) + parseFloat(dataCountry.cases_AB) + parseFloat(dataCountry.controls_AB) + parseFloat(dataCountry.cases_BB) + parseFloat(dataCountry.controls_BB) + parseFloat(dataCountry.cases_NULL) + parseFloat(dataCountry.controls_NULL) + parseFloat(dataCountry.NULL);

                    content += "<tr>";
                    content += "<td>";
                    content += '<b>' + country + '</b>';
                    content += "</td>";
                    $.each(propgroup, function (idx2, prop) {
                        content += "<td>";
                        var st = dataCountry[prop.id];
                        var frac = 0;
                        var fracColor = 'rgb(190,220,255)';
                        if ('fracScale' in prop)
                            frac = prop.fracScale(dataCountry);
                        if ('fracColor' in prop)
                            fracColor = prop.fracColor;
                        st = renderValueBar(st, frac, fracColor);
                        content += st;
                        content += "</td>";
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