import Utils from '@core/Utils.js';
import { CID } from '@app/shared/constants';

export function LoadViewParams<T = any>(payload): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_params,cid="+CID, 
        (error, result, full) => {
            //setReady(true);
            resolve(result.params);
        }, payload);
    });
}

export function LoadProposals<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_proposals,cid="+CID, 
        (error, result, full) => {
            //setReady(true);
            resolve(result.res);
        });
    });
}

export function LoadProposalData<T = any>(id): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_proposal,id=" + id + ",cid=" + CID, 
        (error, result, full) => {
            //setReady(true);
            resolve(result);
        });
    });
}
