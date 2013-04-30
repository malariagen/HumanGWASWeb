
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("ChannelPlot/ChannelYVals"), DQXSC("DataFetcher/DataFetcherFile"), DQXSC("DataFetcher/DataFetchers"), DQXSC("DataFetcher/DataFetcherSummary"), "MetaData"],
    function (require, Framework, Controls, Msg, SQL, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence, ChannelSnps, ChannelYVals, DataFetcherFile, DataFetchers, DataFetcherSummary, MetaData) {

        var GenomeBrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genomebrowser');
                that.myPage = iPage;
                that.registerView();

                //List of components that can be drawn on the genome browser
                that.plotValues = [];
                that.plotValues.push({ id: 'variable1', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: true });
                that.plotValues.push({ id: 'variable2', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: true });
                that.plotValues.push({ id: 'variable3', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: false });
                that.plotValues.push({ id: 'variable4', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: false });
                that.plotValues.push({ id: 'variable5', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: false });
                that.plotValues.push({ id: 'variable6', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: false });
                that.plotValues.push({ id: 'variable7', color: DQX.Color(0, 0, 0.75), hasFilterBank: true, defaultVisible: false });

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
                        annotationChannelHeight: 100,
                        canZoomVert: true
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

                    //Causes the browser to start with a sensible start region
                    var firstChromosome = MetaData.chromosomes[0].id;
                    this.panelBrowser.setChromosome(firstChromosome, true, false);
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 0, MetaData.chromosomes[0].len * 1E6);
                    });

                };


                that.updateChannelVisibility = function () { //updates the visibility status of the elements of the viewer
                    var zoomfact = this.panelBrowser.getZoomFactorX();
                    var showSNPPoints = (zoomfact >= 0.001);
                    if (true/*showSNPPoints != this.showSNPPoints*/) {
                        this.showSNPPoints = showSNPPoints;
                        $.each(that.plotValues, function (idx, plotValue) {
                            var theChannel = that.panelBrowser.findChannel(plotValue.id);
                            var isVisible = plotValue.visibilityCheckBox.getValue();
                            theChannel.modifyComponentActiveStatus(plotValue.id, isVisible && showSNPPoints);
                            if (plotValue.hasFilterBank) {
                                $.each(summaryComps, function (idx, summaryComp) {
                                    var summCompID = 'value_' + summaryComp.id;
                                    var summComp = theChannel.findComponent(summCompID);
                                    theChannel.modifyComponentActiveStatus(summComp.getID(), isVisible);
                                    summComp.setColor(summaryComp.color, summaryComp.opacity * (showSNPPoints ? 0.2 : 1));
                                });
                            }
                        });
                    }
                }


                //Create the channels that show information for each individual SNP
                that.createSNPChannels = function () {

                    //Create data fetcher that will fetch the SNP data
                    this.dataFetcherSNPs = new DataFetchers.Curve(serverUrl, MetaData.database, MetaData.tableSNPInfo, 'pos');
                    this.dataFetcherSNPs.rangeExtension = 0.5; //fetch smaller range extension for speed reasons
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

                    $.each(that.plotValues, function (idx, plotValue) {

                        //Create a channel that will show the IHS values
                        var theChannel = ChannelYVals.Channel(plotValue.id, { minVal: 0, maxVal: +7 });
                        //theChannel.minDrawZoomFactX = 0.0015;
                        theChannel.setTitle(plotValue.id);
                        theChannel.setHeight(200,true);
                        that.panelBrowser.addChannel(theChannel, false);

                        //Attach a custom tooltip creation function to the channel
                        theChannel.getToolTipContent = function (compID, pointIndex) {
                            var value = this.myComponents[compID].myfetcher.getColumnPoint(pointIndex, compID);
                            if (value != null)
                                return that.dataFetcherSNPs.getColumnPoint(pointIndex, 'snpid') + '; ' + compID + '= ' + value.toFixed(2);
                            else
                                return 'No value';
                        }

                        if (plotValue.hasFilterBank) {
                            //Filterbank summaries
                            $.each(summaryComps, function (idx, summaryComp) {
                                var summCompID = 'value_' + summaryComp.id;
                                var colinfo = that.dataFetcherProfiles.addFetchColumn(summaryFolder + '/' + plotValue.id, 'Summ01', summCompID);
                                var summComp = theChannel.addComponent(ChannelYVals.CompFilled(summCompID, that.dataFetcherProfiles, colinfo.myID));
                                summComp.setColor(summaryComp.color, summaryComp.opacity);
                                summComp.myPlotHints.makeDrawLines(3000000.0); //This causes the points to be connected with lines
                                summComp.myPlotHints.interruptLineAtAbsent = true;
                                summComp.myPlotHints.drawPoints = false;
                                theChannel.modifyComponentActiveStatus(summCompID, false, false);
                            });
                        }

                        //Individual SNP values
                        var colinfo = that.dataFetcherSNPs.addFetchColumn(plotValue.id, "Float2");
                        plotcomp = theChannel.addComponent(ChannelYVals.Comp(plotValue.id, that.dataFetcherSNPs, plotValue.id));
                        plotcomp.myPlotHints.color = plotValue.color;
                        plotcomp.myPlotHints.pointStyle = 1;
                        theChannel.modifyComponentActiveStatus(plotValue.id, false);

                        that.panelBrowser.channelModifyVisibility(theChannel.getID(), plotValue.defaultVisible);

                        //create a checkbox controlling the visibility of this component
                        var colorIndicator = Controls.Static('<span style="background-color:{color}">&nbsp;&nbsp;&nbsp;</span>&nbsp;'.DQXformat({ color: plotValue.color.toString() }));
                        var chk = Controls.Check('', { label: plotValue.id, value: plotValue.defaultVisible });
                        chk.setOnChanged(function () {
                            that.panelBrowser.channelModifyVisibility(theChannel.getID(), chk.getValue());
                            that.updateChannelVisibility();
                            that.panelBrowser.render();
                        });
                        plotValue.visibilityCheckBox = chk;
                        controlsList.push(Controls.CompoundHor([colorIndicator, chk]));

                    });

                    //Add the checkboxes that control the visibility of the components
                    that.panelControls.addControl(Controls.CompoundVert(controlsList));
                    this.panelControls.render();

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