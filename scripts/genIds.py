#!/usr/bin/env python

import argparse
import json
from os.path import isfile, abspath
from random import sample

def main():

    parser = argparse.ArgumentParser()
    
    parser.add_argument('--sites', nargs='+', required=True, help='Space separated upper case two-letters site code e.g. --sites NY CA ME, or one JSON file e.g. --sites sites.json. An example JSON file is https://github.com/AMP-SCZ/subject-id-gen/blob/main/sites.json')
    parser.add_argument('-n', type=int, default=9999, help='Number of IDs per site to generate, default 9999')
    parser.add_argument('--out', default='ids.csv', help='Output CSV file, default $CWD/ids.csv')

    args = parser.parse_args()
    
    sites=[]
    if args.sites[0].endswith('.json'):
        with open(abspath(args.sites[0])) as f:
            data= json.load(f)

        for d in data:
            sites.append(d['id'])

    else:
        sites= args.sites

    
    f= open(args.out,'w')
    f.write('id,site\n')

    for site in sites:
        site= site.upper()

        ids=[]
        for i in range(1,args.n+1):

            tmp= f'{site}{i:04}'

            checkDigit=0
            for j in range(6):
                try:
                    checkDigit+= int(tmp[j])*(j+1)
                except:
                    checkDigit+= ord(tmp[j])*(j+1)

            checkDigit%= 10
            ids.append(f'{tmp}{checkDigit}')

        ids=[ids[k] for k in sample(range(args.n),args.n)]

        for id in ids:
            f.write(f'{id},{site}\n')


    f.close()

if __name__=='__main__':
    main()

