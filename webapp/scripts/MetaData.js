define([DQXSC("Utils")],
    function (DQX) {
        var MetaData = {};

        function log10(val) {
            return Math.log(val) / Math.LN10;
        }


        MetaData.database = "dqx_boilerplate_db"; //name of the database used

        MetaData.database = "/mnt/storage/malariagen/human/website/data/analysis.sqlite";

        MetaData.tablePlotValuesInfo = "GenomeBrowserPlotValues"; //Table containing info about the plot value columns as provided in the table "MetaData.tableSNPInfo"

        MetaData.tableSNPInfo = "ManhattanData"; //Table containing the snp data uses to show in the plot

        MetaData.tableSNPDetails = "SNPDetails"; //Table containing the snp details data

        var signifStyle = 'FragmentBarRed';

        MetaData.countries = ['BurkinaFaso', 'Cameroon', 'Gambia', 'Ghana', 'Kenya', 'Malawi', 'Mali', 'Tanzania'];

        //Groups of properties that are available on a per-country basis
        MetaData.countryPropertyGroups = [
            [
            { id: 'AA', fracScale: function (data) { return data.AA / data.samplesTot } },
            { id: 'AB', fracScale: function (data) { return data.AB / data.samplesTot } },
            { id: 'BB', fracScale: function (data) { return data.BB / data.samplesTot } },
            { id: 'B_allele_frequency', fracScale: function (data) { return data.B_allele_frequency } },
            { id: 'maf', fracScale: function (data) { return data.maf } }
            ],
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
            ],
            [
            { id: 'info' },
            { id: 'pvalue', fracScale: function (data) { return -log10(data.pvalue) / 10.0 }, fracStyle: signifStyle },
            { id: 'se_1' },
            { id: 'beta_1' }
            ]
                                    ];


        //////// Information about the chromosomes
        //!!!TODO: this shouldn't be hard-wired, but fetched from the server!!!!
        chromsizes = [250, 245, 205, 195, 185, 175, 165, 150, 145, 140, 140, 135, 120, 110, 105, 95, 85, 80, 70, 70, 55, 52];
        MetaData.chromosomes = [];
        $.each(chromsizes, function (idx, size) {
            id = (idx + 1).toString();
            if (id.length < 2) id = '0' + id;
            MetaData.chromosomes.push({
                id: id,
                name: id,
                len: size
            });
        });

        return MetaData;
    });