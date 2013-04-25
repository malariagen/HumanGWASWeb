define([DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("DocEl"), DQXSC("Msg"), "Views/Intro", "Views/GenomeBrowser"],
    function (Framework, HistoryManager, DocEl, Msg, IntroModule, GenomeBrowserModule) {
        thePage = {

            createFramework: function () {

                thePage.frameRoot = Framework.FrameGroupVert('');
                thePage.frameRoot.setMargins(0);

                //The top line of the page
                thePage.frameHeaderIntro = thePage.frameRoot.addMemberFrame(Framework.FrameFinal('HeaderIntro', 1))
                    .setFixedSize(Framework.dimY, 75).setFrameClassClient('DQXPage');

                
                //The body panel of the page
                thePage.frameBody = thePage.frameRoot.addMemberFrame(Framework.FrameGroupStack('info', 1)).setFrameClassClient('DQXDarkFrame').setMargins(0);

                thePage.frameIntro = thePage.frameBody.addMemberFrame(Framework.FrameFinal('intro', 1))
                .setFrameClass('DQXClient').setDisplayTitle('Introduction'); ;

                thePage.frameGenomeBrowser = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('genomebrowser', 1))
                .setMargins(10).setDisplayTitle('Genome browser'); ;


                //Create the views
                
                thePage.IntroView = IntroModule.Instance(thePage, thePage.frameIntro, thePage.frameHeaderIntro);
                thePage.IntroView.createFramework();

                thePage.GenomeBrowserView = GenomeBrowserModule.Instance(thePage, thePage.frameGenomeBrowser);
                thePage.GenomeBrowserView.createFramework();

                //Register some message handlers that can be used to navigate around in the app
                Msg.listen('', { type: 'Home' }, function (context) { if (!thePage.frameIntro.isVisible()) HistoryManager.setState({ start:null }); });
                //Msg.listen('', { type: 'ShowBrowser' }, function (context, studyid) { thePage.frameBrowser.makeVisible(); });

            }

           
        };

        return thePage;
    });
