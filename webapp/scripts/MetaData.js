define([DQXSC("Utils")],
    function (DQX) {
        var MetaData = {};


        function log10(val) {
            return Math.log(val) / Math.LN10;
        }


        MetaData.database = "panoptes_human"; //name of the database used

        //MetaData.database = "/mnt/storage/malariagen/human/website/data/analysis.sqlite";

        MetaData.tablePlotValuesInfo = "GenomeBrowserPlotValues"; //Table containing info about the plot value columns as provided in the table "MetaData.tableSNPInfo"

        MetaData.tableSNPInfo = "ManhattanData"; //Table containing the snp data uses to show in the plot

        MetaData.tableSNPDetails = "SNPDetails"; //Table containing the snp details data

        var signifColor = 'rgb(255,200,120)';

        MetaData.countries = ['BurkinaFaso', 'Cameroon', 'Gambia', 'Ghana', 'Kenya', 'Malawi', 'Mali', 'Tanzania'];
        MetaData.countryPropertyGroups = [
            [
            { id: 'AA', fracScale: function (data) { return data.AA / data.cases_TOT } },
            { id: 'AB', fracScale: function (data) { return data.AB / data.cases_TOT } },
            { id: 'BB', fracScale: function (data) { return data.BB / data.cases_TOT } },
            { id: 'B_allele_frequency', fracScale: function (data) { return data.B_allele_frequency } },
            { id: 'maf', fracScale: function (data) { return data.maf } }
            ],
            [
            { id: 'cases_AA', fracScale: function (data) { return data.cases_AA / data.cases_TOT } },
            { id: 'controls_AA', fracScale: function (data) { return data.controls_AA / data.cases_TOT } },
            { id: 'cases_AB', fracScale: function (data) { return data.cases_AB / data.cases_TOT } },
            { id: 'controls_AB', fracScale: function (data) { return data.controls_AB / data.cases_TOT } },
            { id: 'cases_BB', fracScale: function (data) { return data.cases_BB / data.cases_TOT } },
            { id: 'controls_BB', fracScale: function (data) { return data.controls_BB / data.cases_TOT } },
            { id: 'cases_NULL', fracScale: function (data) { return data.cases_NULL / data.cases_TOT } },
            { id: 'controls_NULL', fracScale: function (data) { return data.controls_NULL / data.cases_TOT } },
            { id: 'NULL' }
            ],
            [
            { id: 'info' },
            { id: 'pvalue', fracScale: function (data) { return -log10(data.pvalue) / 10.0 }, fracColor: signifColor },
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
