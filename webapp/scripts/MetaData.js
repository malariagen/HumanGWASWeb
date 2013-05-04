define([DQXSC("Utils")],
    function (DQX) {
        var MetaData = {};

        MetaData.database = "dqx_boilerplate_db"; //name of the database used

        MetaData.database = "/mnt/storage/malariagen/human/website/data/analysis.sqlite";

        MetaData.tablePlotValuesInfo = "GenomeBrowserPlotValues"; //Table containing info about the plot value columns as provided in the table "MetaData.tableSNPInfo"

        MetaData.tableSNPInfo = "ManhattanData"; //Table containing the snp data uses to show in the plot

        MetaData.tableSNPDetails = "SNPDetails"; //Table containing the snp details data

        MetaData.countries = ['BurkinaFaso', 'Cameroon', 'Gambia', 'Ghana', 'Kenya', 'Malawi', 'Mali', 'Tanzania'];
        MetaData.countryPropertyGroups = [['AA', 'AB', 'BB', 'maf'],
                                    ['cases_AA', 'controls_AA', 'cases_AB', 'controls_AB', 'cases_BB', 'controls_BB', 'cases_NULL', 'controls_NULL', 'NULL'],
                                    ['info', 'pvalue', 'se_1', 'B_allele_frequency', 'beta_1']
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