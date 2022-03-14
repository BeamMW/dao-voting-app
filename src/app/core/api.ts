import Utils from '@core/utils.js';
import { CID } from '@app/shared/constants';

export function LoadViewParams<T = any>(payload): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_params,cid="+CID, 
        (error, result, full) => {
            //setReady(true);
            resolve(result.params);
        }, payload ? payload : null);
    });
}

export function LoadTotals<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_totals,cid="+CID, 
        (error, result, full) => {
            //setReady(true);
            console.log('view totals full:: ', result);
            resolve(result.res);
        });
    });
}

export function LoadProposals<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_proposals,cid="+CID, 
        (error, result, full) => {
            //setReady(true);
            console.log('PROPOSALS: ', result);
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

export function LoadManagerView<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view,cid=" + CID, 
        (error, result, full) => {
            resolve(result);
        });
    });
}

export function LoadModeratorsView<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_moderators,cid=" + CID, 
        (error, result, full) => {
            resolve(result.res);
        });
    });
}

export function LoadPublicKey<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=user,action=my_key,cid=" + CID, 
        (error, result, full) => {
            resolve(result.key);
        });
    });
}

function Base64EncodeUrl(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

export function AddProposal<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        const propData = JSON.stringify({
            "title": "test title",
            "description": "text about proposal 5",
            "quorum": {
                "type": "asset",
                "value": 5000000000
            },
            "forum_link": "http://test",
            "ref_link": "http://ref-link"
        });
        const proposal = Base64EncodeUrl(window.btoa(propData));
        Utils.invokeContract("role=manager,action=add_proposal,variants=2,text="+proposal+",cid=" + CID, 
        (error, result, full) => {
            console.log('ADD PROPOSAL', error, result, full)
            onMakeTx(error, result, full);
            resolve(result);
        });
    });
}

export function VoteProposal<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=user,action=vote,vote4=0,cid=" + CID, 
        (error, result, full) => {
            console.log('VOTE', error, result, full)
            onMakeTx(error, result, full);
            resolve(result);
        });
    });
}

export function LoadUserView<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=user,action=view,cid=" + CID, 
        (error, result, full) => {
            resolve(result.res);
        });
    });
}

export function UserDeposit<T = any>(amount): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=user,action=move_funds,amount="+ amount +",bLock=1,cid=" + CID, 
        (error, result, full) => {
            onMakeTx(error, result, full);
            resolve(result);
        });
    });
}

export function UserWithdraw<T = any>(amount): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=user,action=move_funds,amount="+ amount +",bLock=0,cid=" + CID, 
        (error, result, full) => {
            console.log('USER WITHDRAW', error, result, full)
            onMakeTx(error, result, full);
            resolve(result);
        });
    });
}

const onMakeTx = (err, sres, full) => {
    if (err) {
        console.log(err, "Failed to generate transaction request")
    }

    //utils.ensureField(full.result, "raw_data", "array")
    Utils.callApi(
        'process_invoke_data', {data: full.result.raw_data}, 
        (...args) => console.log(...args)
    )
}