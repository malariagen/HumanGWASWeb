
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("ChannelPlot/ChannelYVals"), DQXSC("DataFetcher/DataFetcherFile"), DQXSC("DataFetcher/DataFetchers"), DQXSC("DataFetcher/DataFetcherSummary"), "MetaData"],
    function (require, Framework, Controls, Msg, SQL, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence, ChannelSnps, ChannelYVals, DataFetcherFile, DataFetchers, DataFetcherSummary, MetaData) {

        var GenomeBrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genomebrowser');
                that.myPage = iPage;
                that.registerView();

                that.createFramework = function () {
                    this.frameLeft = that.getFrame().addMemberFrame(Framework.FrameGroupVert('settings', 0.01))
                        .setMargins(5).setDisplayTitle('settings group').setFixedSize(Framework.dimX, 380);
                    this.frameControls = this.frameLeft.addMemberFrame(Framework.FrameFinal('settings', 0.7))
                        .setMargins(5).setDisplayTitle('Settings').setFixedSize(Framework.dimX, 380);
                    this.frameBrowser = that.getFrame().addMemberFrame(Framework.FrameFinal('browserPanel', 0.7))
                        .setMargins(0).setDisplayTitle('Browser');

                    Msg.listen("", { type: 'JumpgenomeRegionGenomeBrowser' }, $.proxy(this.onJumpGenomeRegion, this));
                };

                that.createPanels = function () {

                    var browserConfig = {
                        serverURL: serverUrl,
                        chromnrfield: 'chrom',
//                        chromoIdField: 'chromid',//set this to use chromosome id's
                        annotTableName: 'henb37annot',
                        viewID: 'GenomeBrowser',
                        database: MetaData.database,
                        annotationChannelHeight: 100
                    };

                    //Intialise the form with the controls
                    this.panelControls = Framework.Form(this.frameControls);

                    //Initialise the browser
                    this.panelBrowser = GenomePlotter.Panel(this.frameBrowser, browserConfig);
                    this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'exon');
                    this.panelBrowser.getAnnotationChannel().setMinDrawZoomFactX(0.00005);
                    this.panelBrowser.MaxZoomFactX = 1.0 / 0.2;
                    this.panelBrowser.getNavigator().setMinScrollSize(0.0001);

                    //Annotation table has 'chrX' chromosome identifiers rather than numbers, so we translate them
                    //this.panelBrowser.getAnnotationFetcher().translateChromoId = function (id) { return 'chr' + id; }

                    //Define the chromosomes
                    $.each(MetaData.chromosomes, function (idx, chromo) {
                        that.panelBrowser.addChromosome(chromo.id, chromo.id, chromo.len);
                    });

//                    this.createSNPChannels();

                    this.createProfileChannels();

                    //Causes the browser to start with a sensible start region
                    var firstChromosome = MetaData.chromosomes[0].id;
                    this.panelBrowser.setChromosome(firstChromosome, true, false);
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 20000000, 1000000);
                    });

                };


                //Create the channels that show information for each individual SNP
                that.createSNPChannels = function () {

                    //Create data fetcher that will fetch the SNP data
                    this.dataFetcherSNPs = new DataFetchers.Curve(serverUrl, MetaData.database, MetaData.tableSNPInfo, 'pos');
                    this.panelBrowser.addDataFetcher(this.dataFetcherSNPs);

                    //Make sure we fetch the SNP id from the table
                    this.dataFetcherSNPs.addFetchColumn("snpid", "String");
                    this.dataFetcherSNPs.activateFetchColumn("snpid");


                    //Create a channel that will show the IHS values
                    var theChannel = ChannelYVals.Channel('IHS', { minVal: -5, maxVal: +5 });
                    theChannel.minDrawZoomFactX = 0.00005;
                    theChannel.setTitle("IHS");
                    theChannel.setHeight(250);
                    this.panelBrowser.addChannel(theChannel, false);

                    //Attach a custom tooltip creation function to the channel
                    theChannel.getToolTipContent = function (compID, pointIndex) {
                        var value = this.myComponents[compID].myfetcher.getColumnPoint(pointIndex, compID);
                        if (value != null)
                            return that.dataFetcherSNPs.getColumnPoint(pointIndex, 'snpid') + '; ' + compID + '= ' + value.toFixed(2);
                        else
                            return 'No value';
                    }

                    //List of all components that will go into this channel
                    var comps = [
                    { id: 'IHS_Akan', color: DQX.Color(0.2, 0.8, 0.2) },
                    { id: 'IHS_Fula', color: DQX.Color(0.5, 0.5, 0) },
                    { id: 'IHS_Jola', color: DQX.Color(0.2, 0.2, 0.9) },
                    { id: 'IHS_Malawi', color: DQX.Color(0.7, 0.2, 0.7) },
                    { id: 'IHS_Mandinka', color: DQX.Color(0, 0.6, 0.6) },
                    { id: 'IHS_Northerner', color: DQX.Color(0.7, 0.4, 0.2) },
                    { id: 'IHS_Wolof', color: DQX.Color(0, 0.6, 0) },
                    { id: 'IHS_YRI', color: DQX.Color(0, 0, 0) }
                    ];

                    var controlsList = [];

                    $.each(comps, function (idx, comp) {
                        var colinfo = that.dataFetcherSNPs.addFetchColumn(comp.id, "Float2");
                        plotcomp = theChannel.addComponent(ChannelYVals.Comp(comp.id, that.dataFetcherSNPs, comp.id));
                        plotcomp.myPlotHints.color = comp.color;
                        plotcomp.myPlotHints.pointStyle = 1;
                        theChannel.modifyComponentActiveStatus(comp.id, true);

                        that.panelBrowser.channelModifyVisibility(theChannel.getID(), true);

                        //create a checkbox controlling the visibility of this component
                        var colorIndicator = Controls.Static('<span style="background-color:{color}">&nbsp;&nbsp;&nbsp;</span>&nbsp;'.DQXformat({ color: comp.color.toString() }));
                        var chk = Controls.Check('', { label: comp.id, value: true });
                        chk.setOnChanged(function () {
                            theChannel.modifyComponentActiveStatus(comp.id, chk.getValue());
                            that.panelBrowser.render();
                        });
                        controlsList.push(Controls.CompoundHor([colorIndicator, chk]));

                    });

                    //Add the checkboxes that control the visibility of the components
                    that.panelControls.addControl(Controls.CompoundVert(controlsList));
                    this.panelControls.render();

                }


                that.createProfileChannels = function () {
                    this.dataFetcherProfiles = new DataFetcherSummary.Fetcher(serverUrl, 1000, 1200);

                    //this.dataFetcherProfiles.translateChromoId = function (inp) { return 'chr' + inp; } //This translates from numerical chromosome ID's to chrXXX ID's. NOTE !!! : need better method in case of X,Y chromosomes
                    this.panelBrowser.addDataFetcher(this.dataFetcherProfiles);

                    var folder = 'HumanGWAS/Signif'

                    var ID = 'pval';

                    var SummChannel = ChannelYVals.Channel(ID, { minVal: 0, maxVal: 7 });
                    SummChannel.setTitle('Significance');
                    SummChannel.setHeight(300, true);
                    that.panelBrowser.addChannel(SummChannel);

                    var components = [];
                    components.push({ id: 'Max', color: DQX.Color(1.0, 0, 0) });
                    components.push({ id: 'Q99', color: DQX.Color(0, 0, 1.0) });
                    components.push({ id: 'Q95', color: DQX.Color(0, 0, 0.5) });
                    components.push({ id: 'Q50', color: DQX.Color(0, 0, 0.5) });

                    $.each(components, function (idx, component) {
                        var colinfo = that.dataFetcherProfiles.addFetchColumn(folder, 'Summ01', ID + '_' + component.id);
                        var comp = SummChannel.addComponent(ChannelYVals.CompFilled(colinfo.myID, that.dataFetcherProfiles, colinfo.myID));
                        comp.setColor(component.color);
                        comp.myPlotHints.makeDrawLines(3000000.0); //This causes the points to be connected with lines
                        comp.myPlotHints.interruptLineAtAbsent = true;
                        comp.myPlotHints.drawPoints = false;
                        SummChannel.modifyComponentActiveStatus(colinfo.myID, true, false);
                    });
                }



                //Call this function to jump to & highlight a specific region on the genome
                that.onJumpGenomeRegion = function (context, args) {
                    if ('chromoID' in args)
                        var chromoID = args.chromoID;
                    else {
                        DQX.assertPresence(args, 'chromNr');
                        var chromoID = this.panelBrowser.getChromoID(args.chromNr);
                    }
                    DQX.assertPresence(args, 'start'); DQX.assertPresence(args, 'end');
                    this.panelBrowser.highlightRegion(chromoID, (args.start + args.end) / 2, args.end - args.start);
                };


                that.activateState = function () {
                    var tabswitched = that.myPage.frameGenomeBrowser.makeVisible();
                };

                return that;
            }

        };

        return GenomeBrowserModule;
    });