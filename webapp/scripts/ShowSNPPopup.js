define(
    [DQXSCRQ(), DQXSC("Framework"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Popup"), DQXSC("PopupFrame"), DQXSC("Controls"), DQXSC("DataFetcher/DataFetchers"), "MetaData", "scripts/Externals/d3.min.js", "scripts/Externals/sprintf.min.js", "scripts/helper/log10.js"],
    function (require, Framework, Msg, SQL, DocEl, Popup, PopupFrame, Controls, DataFetchers, MetaData) {


        var ShowSNPPopup = {}

        var renderValueBar = function (val, frac, fracStyle, format) {
            var frac = Math.min(1, frac);
            var rs = '';
            if (frac > 0.01)
                rs += '<div class="{fracStyle}" style="height:100%;width:{prc}%;overflow:visible">'.DQXformat({ prc: 100 * frac, fracStyle: fracStyle });
            if( val === undefined || val == "None" ) {
                rs += 'NA' ;
            } else {
                //console.log( "Format:", format, "val:", val ) ;
                rs += sprintf( format, val );
            }
            if (frac > 0.01)
                rs += '<div>';
            return rs;
        }
        
        ShowSNPPopup.createPropertyGroupTab = function( data, propgroup ) {
            var tabItem = { title: propgroup.title };
            var content = '<table class="DQXStyledTable" style="background-color:white;border:1px solid black;margin-right:25px">';

            //write header
            content += "<tr>";
            content += "<th>";
            content += 'Population';
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
                        dataCountry[key.split(':')[1]] = parseFloat( val );
                    }
                });

                //Add calculated property: total number of samples
                dataCountry.samplesTot = (dataCountry.cases_AA) + (dataCountry.controls_AA) + (dataCountry.cases_AB) + (dataCountry.controls_AB) + (dataCountry.cases_BB) + (dataCountry.controls_BB) + (dataCountry.cases_NULL) + (dataCountry.controls_NULL) + (dataCountry.NULL);

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
                    st = renderValueBar( ( st ), frac, fracStyle, prop.format );
                    content += st;
                    content += "</td>";
                });
                content += "</tr>";
            });
            content += "</table><p/>";
            tabItem.content = content;
            return tabItem ;
        }

        ShowSNPPopup.createBayesFactorTab = function( snpid, data ) {
            var tabItem = {
                title: "Meta-analysis models",
                content: '<div class="bayes_factor_plot" snpid="' + snpid + '"></div>',
                snpid: snpid
            } ;

            var keys = Object.keys(data);
            keys.sort(); //we want to show them sorted by name
            tabItem.data = []
            var sum_of_bfs = 0 ;
            
            $.each( keys, function( idx, key ) {
                var elts = key.split('/') ;
                if( elts[ elts.length - 1] == 'bf' ) {
                    var value = data[ key ] ;
                    if( (!(value === undefined )) && ( value == value ) && value != "None" ) {
                        value = parseFloat( value ) ;
                        tabItem.data.push( { variable: MetaData.bayesFactorNameFormatter( key ), value: value } ) ;
                        sum_of_bfs += parseFloat( value ) ;
                    }
                }
            } ) ;

            $.each( tabItem.data, function( d ) {
                d.scaled_value = d.value / sum_of_bfs ;
            })

            tabItem.variables = MetaData.formattedMetaAnalysisModelNameOrder ;
            
            tabItem.render = function() {
                //var variables = this.data.map( function( d ) { return d.variable ; } ).sort() ;
                var variables = this.variables ;

                //console.log( "Plotting:", MetaData, variables, this.data ) ;

                var plotheight = 150 ;
                var plotwidth = 500 ;
                var margins = {
                    left: 70,
                    right: 70,
                    top: 10,
                    bottom: 200
                } ;
                var width = margins.left + margins.right + plotwidth ;
                var height = margins.top + margins.bottom + plotheight ;

                //Table for Bayesian data values
                var plot = d3.select( '.bayes_factor_plot[snpid=' + snpid + ']' )
                    .append( 'svg' )
                    .attr( 'class', 'bar_plot' )
                    .attr( 'width', width )
                    .attr( 'height', height ) ;

                var y_scale = d3.scale.linear()
                    .domain( [0, d3.max( this.data, function( d ) { return d.value ; }) ] )
                    .range( [ plotheight, margins.top ] ) ;

                var x_scale = d3.scale.ordinal()
                    .domain( variables )
                    .range( [ margins.left, width ] )
                    .rangeBands( [ margins.left, width - margins.right ] ) ;

                plot.selectAll( 'line[class="haxistick"]' )
                    .data( variables )
                    .enter()
                    .append( "line" )
                    .attr( 'class', 'haxistick' )
                    .attr( 'x1', function( d ) { return x_scale( d ) + 5; })
                    .attr( 'x2', function( d ) { return x_scale( d ) + 5 ; })
                    .attr( 'y1', plotheight )
                    .attr( 'y2', plotheight + 5 )
                    .text( function( d ) { return d ; } )
                ;

                plot.selectAll( 'text[class="haxislabel"]' )
                    .data( variables )
                    .enter()
                    .append( "text" )
                    .attr( 'class', 'haxislabel' )
                    .attr( 'dominant-baseline', 'central' )
                    .attr( 'text-align', 'start' )
                    .attr( 'transform', function( d ) { return "translate(" + ( x_scale( d ) + 5 ) + "," + ( plotheight + 6 ) + ") rotate( 60 )" ; } )
                    .text( function( d ) { return d ; } )
                ;

                plot.selectAll( 'line[class="vaxistick"]' )
                    .data( y_scale.ticks( 10 ) )
                    .enter()
                    .append( "line" )
                    .attr( 'class', 'vaxistick' )
                    .attr( 'x1', margins.left - 6 )
                    .attr( 'x2', margins.left - 1 )
                    .attr( 'y1', y_scale )
                    .attr( 'y2', y_scale )
                ;

                plot.selectAll( 'text[class="vaxislabel"]' )
                    .data( y_scale.ticks( 10 ) )
                    .enter()
                    .append( "text" )
                    .attr( 'class', 'vaxislabel' )
                    .attr( 'x', margins.left - 6 )
                    .attr( 'dx', -3 )
                    .attr( 'y', y_scale )
                    .attr( 'dominant-baseline', 'central' )
                    .attr( 'text-anchor', 'end' )
                    .text(
                        function( d ) {
                            return d + "" ;
                        }
                    )
                ;

                plot.selectAll( 'rect' )
                    .data( this.data )
                    .enter()
                    .append( 'rect' )
                    .attr( 'width', 11 )
                    .attr( 'height', function( d ) { return plotheight - y_scale( d.value ) ; } )
                    .attr( 'y', function( d ) { return y_scale( d.value ) ; } )
                    .attr( 'x', function( d ) { return x_scale( d.variable ) ; } )
                ;
            }

            return tabItem ;
        }

        ShowSNPPopup.createPopup = function (data) {
	        var snpid = data[ MetaData.databases.Analysis.tables.SNPDetails.snpIdColumn ];
            var tabs = []; //Will contain a list of all tabs, defined as objects with 'title' and 'content'

            {
                var tabItem = { title: "Overview" } ;
                tabs.push( tabItem ) ;
            }

            {
                var tabItem = { title: "Size of effect" } ;
                tabs.push( tabItem ) ;
            }

            var this_obj = this ;
            //Create a table per group of per-country properties
            $.each(MetaData.countryPropertyGroups, function (idx0, propgroup) {
                tabs.push( this_obj.createPropertyGroupTab( data, propgroup ) ) ;
            });

            //Remove all country-related data values
            $.each(MetaData.countries, function (idx1, country) {
                $.each(data, function (key, val) {
                    if (key.split(':')[0] == country)
                        delete data[key];
                });
            });

            tabs.push( this_obj.createBayesFactorTab( snpid, data ) );


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
                if( tabItem.hasOwnProperty( 'render' ) ) {
                    tabItem.render() ;
                }
            });
        }
        
        ShowSNPPopup.handlePopup = function (snpid) {
            var dataFetcher = ShowSNPPopup.dataFetcherSNPDetails;
            dataFetcher.fetchFullRecordInfo(
                SQL.WhereClause.CompareFixed( MetaData.databases.Analysis.tables.SNPDetails.snpIdColumn, '=', snpid),
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
            ShowSNPPopup.dataFetcherSNPDetails = new DataFetchers.Curve(serverUrl, MetaData.databases.Analysis.url, MetaData.databases.Analysis.tables.SNPDetails.tableName, MetaData.databases.Analysis.tables.SNPDetails.positionColumn );

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
