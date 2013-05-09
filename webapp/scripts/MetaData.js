define([DQXSC("Utils"), "scripts/helper/log10.js"],
    function (DQX) {
        var MetaData = null ;
        $.ajax({
            type: 'GET',
            url: 'resources/metadata.json',
            dataType: 'json',
            success: function( data ) { MetaData = data.MetaData ; },
            data: {},
            async: false
        });

        var signifStyle = 'FragmentBarRed';

        //Groups of properties that are available on a per-country basis.
        //Setting these here because they have functions which JSON doesn't support.
        MetaData.countryPropertyGroups = [
            { 
                title: 'Alleles',
                members: [
                    { id: 'AA', fracScale: function (data) { return data.AA / data.samplesTot }, format:"%.0f" },
                    { id: 'AB', fracScale: function (data) { return data.AB / data.samplesTot }, format: "%.0f" },
                    { id: 'BB', fracScale: function (data) { return data.BB / data.samplesTot }, format: "%.0f" },
                    { id: 'B_allele_frequency', fracScale: function (data) { return data.B_allele_frequency }, format: "%.2f" },
                    { id: 'maf', fracScale: function (data) { return data.maf }, format: "%.2f" }
                ]
            },
            { 
                title: 'Cases/Controls',
                members: [
                    { id: 'cases_AA', fracScale: function (data) { return data.cases_AA / data.samplesTot }, format: "%.0f" },
                    { id: 'controls_AA', fracScale: function (data) { return data.controls_AA / data.samplesTot }, format: "%.0f" },
                    { id: 'cases_AB', fracScale: function (data) { return data.cases_AB / data.samplesTot }, format: "%.0f" },
                    { id: 'controls_AB', fracScale: function (data) { return data.controls_AB / data.samplesTot }, format: "%.0f" },
                    { id: 'cases_BB', fracScale: function (data) { return data.cases_BB / data.samplesTot }, format: "%.0f" },
                    { id: 'controls_BB', fracScale: function (data) { return data.controls_BB / data.samplesTot }, format: "%.0f" },
                /*            { id: 'cases_NULL', fracScale: function (data) { return data.cases_NULL / data.samplesTot } },
                { id: 'controls_NULL', fracScale: function (data) { return data.controls_NULL / data.samplesTot } },
                { id: 'NULL' }*/
                ]
            },
            { 
                title: 'Frequentist',
                members: [
                    { id: 'info', format: "%.2f" },
                    { id: 'pvalue', fracScale: function (data) { return -log10(data.pvalue) / 10.0 }, fracStyle: signifStyle, format: "%.2f" },
                    { id: 'se_1', format: "%.2f" },
                    { id: 'beta_1', format: "%.2f" }
                ]
            }
        ];
        
        MetaData.bayesFactorNameFormatter = function( v ) {
            // Remove boilerplate
            v = v.replace( 'ApproximateBayesianMetaAnalysis/', '' )
                .replace( '/bf', '' )
            ;
            // Get rid of unnecessary rho specs..
            if( v.indexOf( '-specific' ) != -1 && v.indexOf( 'West-africa' ) == -1 && v.indexOf( 'East-africa' ) == -1 ) {
                v = v.replace( 'rho=1/', '' ) ;
            }
            // rename some variables.
            if( v.substring( 0, 5 ) == 'rho=1' ) {
                v = v.replace( 'rho=1', 'fixed-effect' ) ;
            } else if( v.substring( 0, 5 ) == 'rho=0' ) {
                v = v.replace( 'rho=1', 'independent-effect' ) ;
            }
            return v ;
        }

        return MetaData;
    });
