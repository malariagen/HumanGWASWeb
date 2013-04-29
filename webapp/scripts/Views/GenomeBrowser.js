
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("ChannelPlot/ChannelYVals"), DQXSC("DataFetcher/DataFetcherFile"), DQXSC("DataFetcher/DataFetchers"), DQXSC("DataFetcher/DataFetcherSummary"), "MetaData"],
    function (require, Framework, Controls, Msg, SQL, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence, ChannelSnps, ChannelYVals, DataFetcherFile, DataFetchers, DataFetcherSummary, MetaData) {

        var GenomeBrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genomebrowser');
                that.myPage = iPage;
                that.registerView();

                //List of components that can be drawn on the genome browser
                that.plotComponents = [];
                that.plotComponents.push({ id: 'variable1', filterbankFolder: 'Signif', filterbankID: 'pval', color: DQX.Color(0.0, 0.0, 0.8) });
                that.plotComponents.push({ id: 'variable2', filterbankFolder: 'variable2', filterbankID: 'value', color: DQX.Color(0.0, 0.0, 0.8) });
                that.plotComponents.push({ id: 'variable3', color: DQX.Color(0.0, 0.0, 0.8) });
                that.plotComponents.push({ id: 'variable4', color: DQX.Color(0.0, 0.0, 0.8) });
                that.plotComponents.push({ id: 'variable5', color: DQX.Color(0.0, 0.0, 0.8) });
                that.plotComponents.push({ id: 'variable6', color: DQX.Color(0.0, 0.0, 0.8) });
                that.plotComponents.push({ id: 'variable7', color: DQX.Color(0.0, 0.0, 0.8) });

                //List of filterbanked summary elements to draw
                var summaryComps = [];
                summaryComps.push({ id: 'Max', color: DQX.Color(0.0, 0, 1.0), opacity: 1.0 });
                summaryComps.push({ id: 'Q99', color: DQX.Color(1.0, 0, 0.0), opacity: 0.35 });
                summaryComps.push({ id: 'Q95', color: DQX.Color(0.5, 0, 0.0), opacity: 0.35 });
                summaryComps.push({ id: 'Q50', color: DQX.Color(0.0, 0, 0.0), opacity: 0.35 });


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
                        //                        chromnrfield: 'chrom',
                        chromoIdField: 'chrom', //set this to use chromosome id's
                        annotTableName: 'annotation_tbl',
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

                    Msg.listen('', { type: 'ZoomFactorXChanged', id: this.panelBrowser.myID }, $.proxy(that.updateChannelVisibility, that));

                    //Annotation table has 'chrX' chromosome identifiers rather than numbers, so we translate them
                    this.panelBrowser.getAnnotationFetcher().translateChromoId = function (id) { return 'chr' + parseInt(id); }

                    //Define the chromosomes
                    $.each(MetaData.chromosomes, function (idx, chromo) {
                        that.panelBrowser.addChromosome(chromo.id, chromo.id, chromo.len);
                    });

                    this.createSNPChannels();

                    //                    this.createProfileChannels();

                    //Causes the browser to start with a sensible start region
                    var firstChromosome = MetaData.chromosomes[0].id;
                    this.panelBrowser.setChromosome(firstChromosome, true, false);
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 0, MetaData.chromosomes[0].len * 1E6);
                    });

                };


                that.updateChannelVisibility = function () { //updates the visibility status of the elements of the viewer
                    var zoomfact = this.panelBrowser.getZoomFactorX();
                    var showSNPPoints = (zoomfact >= 0.0015);
                    if (showSNPPoints != this.showSNPPoints) {
                        this.showSNPPoints = showSNPPoints;
                        $.each(that.plotComponents, function (idx, comp) {
                            var theChannel = that.panelBrowser.findChannel(comp.id);
                            theChannel.modifyComponentActiveStatus(comp.id, showSNPPoints);
                            if ('filterbankFolder' in comp) {
                                var summaryID = comp.filterbankID;
                                $.each(summaryComps, function (idx, summaryComp) {
                                    var summCompID = summaryID + '_' + summaryComp.id;
                                    var summComp = theChannel.findComponent(summCompID);
                                    summComp.setColor(summaryComp.color, summaryComp.opacity * (showSNPPoints?0.2:1));
                                });
                            }
                        });
                        //that.panelBrowser.render();
                    }
                }


                //Create the channels that show information for each individual SNP
                that.createSNPChannels = function () {

                    //Create data fetcher that will fetch the SNP data
                    this.dataFetcherSNPs = new DataFetchers.Curve(serverUrl, MetaData.database, MetaData.tableSNPInfo, 'pos');
                    this.panelBrowser.addDataFetcher(this.dataFetcherSNPs);

                    //Create data fetcher that will fetch the filterbanked data
                    this.dataFetcherProfiles = new DataFetcherSummary.Fetcher(serverUrl, 1000, 1200);
                    this.dataFetcherProfiles.translateChromoId = function (inp) { return 'chr' + parseInt(inp); }
                    this.panelBrowser.addDataFetcher(this.dataFetcherProfiles);
                    var summaryFolder = 'FilterBank';


                    //Make sure we fetch the SNP id from the table
                    this.dataFetcherSNPs.addFetchColumn("snpid", "String");
                    this.dataFetcherSNPs.activateFetchColumn("snpid");




                    //List of all components that will go into this channel
                    var controlsList = [];

                    $.each(that.plotComponents, function (idx, comp) {

                        //Create a channel that will show the IHS values
                        var theChannel = ChannelYVals.Channel(comp.id, { minVal: 0, maxVal: +7 });
                        //theChannel.minDrawZoomFactX = 0.0015;
                        theChannel.setTitle(comp.id);
                        theChannel.setHeight(200);
                        that.panelBrowser.addChannel(theChannel, false);

                        //Attach a custom tooltip creation function to the channel
                        theChannel.getToolTipContent = function (compID, pointIndex) {
                            var value = this.myComponents[compID].myfetcher.getColumnPoint(pointIndex, compID);
                            if (value != null)
                                return that.dataFetcherSNPs.getColumnPoint(pointIndex, 'snpid') + '; ' + compID + '= ' + value.toFixed(2);
                            else
                                return 'No value';
                        }

                        if ('filterbankFolder' in comp) {
                            //Filterbank summaries
                            var summaryID = comp.filterbankID;
                            $.each(summaryComps, function (idx, summaryComp) {
                                var summCompID = summaryID + '_' + summaryComp.id;
                                var colinfo = that.dataFetcherProfiles.addFetchColumn(summaryFolder + '/' + comp.filterbankFolder, 'Summ01', summCompID);
                                var summComp = theChannel.addComponent(ChannelYVals.CompFilled(summCompID, that.dataFetcherProfiles, colinfo.myID));
                                summComp.setColor(summaryComp.color, summaryComp.opacity);
                                summComp.myPlotHints.makeDrawLines(3000000.0); //This causes the points to be connected with lines
                                summComp.myPlotHints.interruptLineAtAbsent = true;
                                summComp.myPlotHints.drawPoints = false;
                                theChannel.modifyComponentActiveStatus(summCompID, true, false);
                            });
                        }

                        //Individual SNP values
                        var colinfo = that.dataFetcherSNPs.addFetchColumn(comp.id, "Float2");
                        plotcomp = theChannel.addComponent(ChannelYVals.Comp(comp.id, that.dataFetcherSNPs, comp.id));
                        plotcomp.myPlotHints.color = comp.color;
                        plotcomp.myPlotHints.pointStyle = 1;
                        theChannel.modifyComponentActiveStatus(comp.id, false);

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

                    this.dataFetcherProfiles.translateChromoId = function (inp) { return 'chr' + parseInt(inp); }
                    this.panelBrowser.addDataFetcher(this.dataFetcherProfiles);

                    var folder = 'FilterBank/Signif'

                    var ID = 'pval';

                    var SummChannel = ChannelYVals.Channel(ID, { minVal: 0, maxVal: 7 });
                    SummChannel.setTitle('Significance');
                    SummChannel.setHeight(200, true);
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