define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup, Controls, DataFetchers, MetaData) {


        var ShowSNPPopup = {}

        function log10(val) {
            return Math.log(val) / Math.LN10;
        }


        var renderValueBar = function (val, frac, fracStyle) {
            var frac = Math.min(1, frac);
            var rs = '';
            if (frac > 0.01)
                rs += '<div class="{fracStyle}" style="height:100%;width:{prc}%;overflow:visible">'.DQXformat({ prc: 100 * frac, fracStyle: fracStyle });
            rs += val;
            if (frac > 0.01)
                rs += '<div>';
            return rs;

        }


        ShowSNPPopup.createPopup = function (data) {
            var snpid = data['snpid'];
            var content = '<div style="max-height:700px;overflow-x:none">';

            //Create a table per group of per-country properties
            $.each(MetaData.countryPropertyGroups, function (idx0, propgroup) {
                content += '<table class="DQXStyledTable" style="background-color:white;border:1px solid black;margin-right:25px">';

                //write header
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

                //Create a row per country
                $.each(MetaData.countries, function (idx1, country) {
                    //Extract the properties for this specific country
                    var dataCountry = {};
                    $.each(data, function (key, val) {
                        if (key.split(':')[0] == country) {
                            dataCountry[key.split(':')[1]] = val;
                        }
                    });

                    //Add calculated property: total number of samples
                    dataCountry.samplesTot = parseFloat(dataCountry.cases_AA) + parseFloat(dataCountry.controls_AA) + parseFloat(dataCountry.cases_AB) + parseFloat(dataCountry.controls_AB) + parseFloat(dataCountry.cases_BB) + parseFloat(dataCountry.controls_BB) + parseFloat(dataCountry.cases_NULL) + parseFloat(dataCountry.controls_NULL) + parseFloat(dataCountry.NULL);

                    content += "<tr>";
                    content += "<td>";
                    content += '<b>' + country + '</b>';
                    content += "</td>";
                    $.each(propgroup, function (idx2, prop) {
                        content += "<td>";
                        var st = dataCountry[prop.id];
                        var frac = 0.0;
                        var fracStyle = 'FragmentBarBlue';
                        if ('fracScale' in prop)
                            frac = prop.fracScale(dataCountry);
                        if ('fracStyle' in prop)
                            fracStyle = prop.fracStyle;
                        st = renderValueBar(st, frac, fracStyle);
                        content += st;
                        content += "</td>";
                    });
                    content += "</tr>";
                });
                content += "</table><p/>";
            });

            //Remove all country-related data values
            $.each(MetaData.countries, function (idx1, country) {
                $.each(data, function (key, val) {
                    if (key.split(':')[0] == country)
                        delete data[key];
                });
            });

            //Table for Bayesian data values
            var keys = Object.keys(data);keys.sort();//we want to show them sorted by name
            content += '<table class="DQXStyledTable" style="background-color:white;border:1px solid black">';
            content += "<tr>";
            content += "<th>";
            content += 'ApproximateBayesianMetaAnalysis';
            content += "</th>";
            content += "<th>";
            content += 'Bayes factor';
            content += "</th>";
            content += "</tr>";
            content += "</tr>";

            $.each(keys, function (idx, key) {
                if (key.split('/')[0] == 'ApproximateBayesianMetaAnalysis') {
                    var tokens = key.split('/').slice(1);
                    content += "<tr>";
                    content += "<td>";
                    content += '<b>' + tokens.join('; ') + '</b>';
                    content += "</td>";
                    content += "<td>";
                    content += renderValueBar(data[key], log10(1.0 + parseFloat(data[key])) / 15.0, 'FragmentBarRed');
                    content += "</td>";
                    content += "</tr>";
                    delete data[key];
                }
            });
            content += "</table><p/>";


            //Dump remaining data values
            content += DQX.CreateKeyValueTable(data);

            //--> SNP popup content goes here

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