define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup, Controls, DataFetchers, MetaData) {


        var ShowGenePopup = {}



        ShowGenePopup.createPopup = function (geneid, data) {

            var content = '';
            content += DQX.CreateKeyValueTable(data);
            //--> Gene popup content goes here

            var args = { buttonClass: 'DQXToolButton2', content: 'Show in Ensembl', width: 150, height: 31 }
            var bt = Controls.Button(null, args);
            bt.setOnChanged(function () {
                var url = 'http://www.ensembl.org/Homo_sapiens/Gene/Summary?g={geneid};'.DQXformat({ geneid: geneid });
                window.open(url, '_blank');
            });
            content += bt.renderHtml();


            var popupID = Popup.create("Gene " + geneid, content);

        }


        ShowGenePopup.handlePopup = function (geneid) {
            var myurl = DQX.Url(serverUrl);
            myurl.addUrlQueryItem("datatype", 'recordinfo');
            myurl.addUrlQueryItem("qry", SQL.WhereClause.encode(SQL.WhereClause.CompareFixed('fid', '=', geneid)));
            myurl.addUrlQueryItem("database", MetaData.databases.Annotation.url);
            myurl.addUrlQueryItem("tbname", MetaData.databases.Annotation.tables.Annotation.tableName );
            $.ajax({
                url: myurl.toString(),
                success: function (resp) {
                    DQX.stopProcessing();
                    var keylist = DQX.parseResponse(resp);
                    if ("Error" in keylist) {
                        alert(keylist.Error);
                        return;
                    }
                    ShowGenePopup.createPopup(geneid, keylist.Data);
                },
                error: DQX.createMessageFailFunction()
            });
            DQX.setProcessing("Downloading...");

        }

        ShowGenePopup.init = function () {

            //Create event listener for actions to open a SNP popup window
            Msg.listen('', { type: 'ShowGenePopup' }, function (context, geneid) {
                ShowGenePopup.handlePopup(geneid);
            });
        }

        return ShowGenePopup;
    });