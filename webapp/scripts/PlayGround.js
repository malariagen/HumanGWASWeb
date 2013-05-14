define(
    [DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("PopupFrame"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"),
    "MetaData", "scripts/Externals/d3.min.js", "scripts/Externals/sprintf.min.js", "scripts/helper/log10.js", "scripts/helper/console.js"],
    function (require, Framework, Msg, SQL, DocEl, Popup, PopupFrame, Controls, DataFetchers, MetaData) {


        var PlayGround = {}

        PlayGround.testPopup = function () {//a test function
            var popup = PopupFrame.PopupFrame('testPopupFrame', Framework.FrameGroupHor(''), { title: 'Test', sizeX: 900, sizeY: 400 });
            var frameRoot = popup.getFrameRoot();
            frameRoot.setFrameClass('DQXLight');
            frameRoot.setMarginsIndividual(0, 7, 0, 0);

            var settFrame = frameRoot.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle('Settings');

            var tabpanel = frameRoot.addMemberFrame(Framework.FrameGroupTab('', 0.5)).setMarginsIndividual(0, 7, 0, 0).setDisplayTitle('Part 2').setFrameClass('DQXLight').setFrameClassClient('DQXForm');
            tabpanel.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle('Tab 1');
            tabpanel.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(5).setDisplayTitle('Tab 2');

            var stackpanel = frameRoot.addMemberFrame(Framework.FrameGroupStack('', 0.5)).setMarginsIndividual(0, 7, 0, 0).setDisplayTitle('Part 3').setFrameClass('DQXLight').setFrameClassClient('DQXForm');
            var tb01 = stackpanel.addMemberFrame(Framework.FrameFinal('tb01', 0.5)).setMargins(5);
            var tb02 = stackpanel.addMemberFrame(Framework.FrameFinal('tb02', 0.5)).setMargins(5);


            popup.render();

            var settForm = Framework.Form(settFrame);
            var chk = Controls.Check('', { label: 'Switch', value: true });
            settForm.addControl(chk);
            chk.setOnChanged(function () {
                showhide1.setVisible(chk.getValue());
                showhide2.setVisible(!chk.getValue());
                stackpanel.switchTab(chk.getValue() ? 'tb01' : 'tb02');
            });

            var cmp1 = Controls.CompoundVert([Controls.Check('', { label: 'Check1' }), Controls.Check('', { label: 'Check2' })]);
            cmp1.setLegend('Group 1');
            var showhide1 = Controls.ShowHide(cmp1);
            settForm.addControl(showhide1);

            var cmp2 = Controls.CompoundVert([Controls.Static('Test controls'), Controls.Check('', { label: 'Check 21' }), Controls.Check('', { label: 'Check 22' })]);
            cmp2.setLegend('Group 2');
            var showhide2 = Controls.ShowHide(cmp2).setVisible(false);
            settForm.addControl(showhide2);

            settForm.render();

            tb01.setContentHtml('The content of stack component 1');
            tb02.setContentHtml('The content of stack component 2<br/>22222222222222222222');

        }


        return PlayGround;
    });
