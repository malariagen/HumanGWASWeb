define([DQXSC("Utils")],
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

		function log10(val) {
		    return Math.log(val) / Math.LN10;
		}

		//Groups of properties that are available on a per-country basis.
		//Setting these here because they have functions which JSON doesn't support.
		MetaData.countryPropertyGroups = [
	        { 
	            title: 'Alleles',
	            members:
	            [
	            { id: 'AA', fracScale: function (data) { return data.AA / data.samplesTot } },
	            { id: 'AB', fracScale: function (data) { return data.AB / data.samplesTot } },
	            { id: 'BB', fracScale: function (data) { return data.BB / data.samplesTot } },
	            { id: 'B_allele_frequency', fracScale: function (data) { return data.B_allele_frequency } },
	            { id: 'maf', fracScale: function (data) { return data.maf } }
	            ]
	        },
	        { 
	            title: 'Cases/Controls',
	            members:
	            [
	            { id: 'cases_AA', fracScale: function (data) { return data.cases_AA / data.samplesTot } },
	            { id: 'controls_AA', fracScale: function (data) { return data.controls_AA / data.samplesTot } },
	            { id: 'cases_AB', fracScale: function (data) { return data.cases_AB / data.samplesTot } },
	            { id: 'controls_AB', fracScale: function (data) { return data.controls_AB / data.samplesTot } },
	            { id: 'cases_BB', fracScale: function (data) { return data.cases_BB / data.samplesTot } },
	            { id: 'controls_BB', fracScale: function (data) { return data.controls_BB / data.samplesTot } },
	            /*            { id: 'cases_NULL', fracScale: function (data) { return data.cases_NULL / data.samplesTot } },
	            { id: 'controls_NULL', fracScale: function (data) { return data.controls_NULL / data.samplesTot } },
	            { id: 'NULL' }*/
	            ]
	        },
	        { 
	            title: 'Frequentist',
	            members:
	            [
	            { id: 'info' },
	            { id: 'pvalue', fracScale: function (data) { return -log10(data.pvalue) / 10.0 }, fracStyle: signifStyle },
	            { id: 'se_1' },
	            { id: 'beta_1' }
	            ]
	        }
        ];

        return MetaData;
    });
