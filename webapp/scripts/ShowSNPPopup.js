define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("PopupFrame"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup, PopupFrame, Controls, DataFetchers, MetaData) {


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
            var snpid = data[ MetaData.databases.Analysis.tables.SNPDetails.snpIdColumn ];

            var tabs = []; //Will contain a list of all tabs, defined as objects with 'title' and 'content'

            //Create a table per group of per-country properties
            $.each(MetaData.countryPropertyGroups, function (idx0, propgroup) {
                var tabItem = { title: propgroup.title };
                var content = '<table class="DQXStyledTable" style="background-color:white;border:1px solid black;margin-right:25px">';

                //write header
                content += "<tr>";
                content += "<th>";
                content += 'Country';
                content += "</th>";
                $.each(propgroup.members, function (idx1, prop) {
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
                    $.each(propgroup.members, function (idx2, prop) {
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
                tabItem.content = content;
                tabs.push(tabItem);
            });

            //Remove all country-related data values
            $.each(MetaData.countries, function (idx1, country) {
                $.each(data, function (key, val) {
                    if (key.split(':')[0] == country)
                        delete data[key];
                });
            });

            //Table for Bayesian data values
            var keys = Object.keys(data); keys.sort(); //we want to show them sorted by name
            var tabItem = { title: 'Bayes factors' }
            var content = '<table class="DQXStyledTable" style="background-color:white;border:1px solid black">';
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
            content += "</table>";
            tabItem.content = content;
            tabs.push(tabItem);


            //Dump remaining data values
            tabs.push({ title: 'Other', content: DQX.CreateKeyValueTable(data) });

            //--> SNP popup content goes here (add items to 'tabs')

            //Creation of the PopupFrame
            var popup = PopupFrame.PopupFrame(Framework.FrameGroupTab(''), {title: snpid, sizeX: 700, sizeY:400 });
            var frameRoot = popup.getFrameRoot();
            frameRoot.setFrameClass('DQXForm');
            frameRoot.setMarginsIndividual(0, 7, 0, 0);

            $.each(tabs, function (idx, tabItem) {
                tabItem.frame = frameRoot.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle(tabItem.title).setFrameClassClient('DQXForm');
            });

            popup.render();


            $.each(tabs, function (idx, tabItem) {
                tabItem.frame.setContentHtml(tabItem.content);
            });


        }


        ShowSNPPopup.handlePopup = function (snpid) {
            var dataFetcher = ShowSNPPopup.dataFetcherSNPDetails;
            dataFetcher.fetchFullRecordInfo(
                SQL.WhereClause.CompareFixed( MetaData.databases.Analysis.tables.snpIdColumn, '=', snpid),
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
            ShowSNPPopup.dataFetcherSNPDetails = new DataFetchers.Curve(serverUrl, MetaData.databases.Analysis.url, MetaData.databases.Analysis.tables.SNPDetails, 'pos');

            //Create event listener for actions to open a SNP popup window
            Msg.listen('', { type: 'ShowSNPPopup' }, function (context, snpid) {
                ShowSNPPopup.handlePopup(snpid);
            });
        }


        ShowSNPPopup.create2 = function () {//a test function
            var popup = PopupFrame.PopupFrame(Framework.FrameGroupHor(''), {});
            var frameRoot = popup.getFrameRoot();
            frameRoot.setFrameClass('DQXLight');
            frameRoot.setMarginsIndividual(0, 7, 0, 0);

            var settFrame = frameRoot.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle('Settings');

            var tabpanel = frameRoot.addMemberFrame(Framework.FrameGroupTab('', 0.5)).setMarginsIndividual(0, 7, 0, 0).setDisplayTitle('Part 2').setFrameClass('DQXLight').setFrameClassClient('DQXForm');

            tabpanel.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle('Tab 1');
            tabpanel.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle('Tab 2');


            popup.render();

            var settForm = Framework.Form(settFrame);
            settForm.addControl(Controls.Static('Test'));
            settForm.render();

        }

        return ShowSNPPopup;
    });