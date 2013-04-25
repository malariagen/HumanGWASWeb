define([DQXSC("Utils")],
    function (DQX) {
        var MetaData = {};

        MetaData.database = "dqx_boilerplate_db"; //name of the database used

        MetaData.database = "/mnt/storage/malariagen/human/website/data/analysis.sqlite";

        MetaData.tableSNPInfo = "PlotView"; //name of the table containing the snp data

        //////// Information about the chromosomes
        //!!!TODO: this shouldn't be hard-wired, but fetched from the server!!!!
        chromsizes = [250, 245, 205, 195, 185, 175, 165, 150, 145, 140, 140, 135, 120, 110, 105, 95, 85, 80, 70, 70, 55, 52];
        MetaData.chromosomes = [];
        $.each(chromsizes, function (idx, size) {
            MetaData.chromosomes.push({
                id: 'chr'+(idx + 1).toString(),
                name: 'chr'+(idx + 1).toString(),
                len: size
            });
        });

        return MetaData;
    });