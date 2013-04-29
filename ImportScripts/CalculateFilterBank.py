import os
import shutil
import sys


if len(sys.argv)<5:
    print('Usage: COMMAND SQLiteFile TableName ColumnName SummConfig')
    print('   SQLiteFile: SQLite database containing the data')
    print('   TableName: table containing the values to be summarised')
    print('   ColumnName: column containing the values to be summarised')
    print('')
    print('   COMMAND /mnt/storage/malariagen/human/website/data/analysis.sqlite ManhattanData variable1 Summ01')

    sys.exit()



database=sys.argv[1]
tablename=sys.argv[2]
colname=sys.argv[3]
summconfig=sys.argv[4]


outputdir='./'+colname
if not os.path.exists(outputdir):
    os.makedirs(outputdir)

shutil.copyfile(summconfig+'.cnf',outputdir+'/'+summconfig+'.cnf')


for chromnr in range(1,23):
    cmd='sqlite3 -header -separator "|" {3}  "SELECT pos as Position, \\"{2}\\" AS value FROM {5} WHERE chrom == \'{0}\' and \\"{2}\\" is not null order by pos" > {4}/chr{1}.txt'.format(str(chromnr).zfill(2),str(chromnr),colname,database,outputdir,tablename)
    print(cmd)
    print('executing...')
    os.system(cmd)

cmd='python /srv/gwas/server/code/DQXServer/_CreateFilterBankData.py {0} {1}'.format(colname,summconfig)
os.system(cmd)
