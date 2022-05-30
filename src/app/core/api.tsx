import Utils from '@core/utils.js';
import { CID } from '@app/shared/constants';
import { ProposalData } from './types';
import { Base64EncodeUrl } from '@core/appUtils';

import React from 'react';
import { toast } from 'react-toastify';
import { encode } from 'js-base64';

export function LoadViewParams<T = any>(payload): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_params,cid="+CID, 
        (error, result, full) => {
            resolve(result.params);
        }, payload ? payload : null);
    });
}

export function LoadTotals<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_totals,cid="+CID, 
        (error, result, full) => {
            resolve(result.res);
        });
    });
}

export function LoadProposals<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_proposals,cid="+CID, 
        (error, result, full) => {
            resolve(result.res);
        });
    });
}

export function LoadProposalData<T = any>(id): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=manager,action=view_proposal,id=" + id + ",cid=" + CID, 
        (error, result, full) => {
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

export function AddProposal<T = any>(payload: ProposalData): Promise<T> {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(payload);
        const proposal = Base64EncodeUrl(encode(jsonData));
        Utils.invokeContract(`role=manager,action=add_proposal,variants=2,text=${proposal},cid=${CID}`, 
        (error, result, full) => {
            onMakeTx(error, result, full, null, payload.title);
            resolve(result);
        });
    });
}

export function VoteProposal<T = any>(votes: number[], id: number, vote: number, counter: number): Promise<T> {
    return new Promise((resolve, reject) => {
        localStorage.setItem('voteCounter', ''+counter);
        let votesParams = '';
        for (let i = 0; i < votes.length; i++) {
            votesParams += `vote_${i + 1}=${votes[i]},`
        }

        const req = "role=user,action=vote," + votesParams + "voteCounter=" + counter + ",cid=" + CID;
        console.log('VOTE PROCESS: ', req);
        Utils.invokeContract(req, 
        (error, result, full) => {
            onMakeTx(error, result, full, {id, vote});
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

export function LoadVotes<T = any>(): Promise<T> {
    return new Promise((resolve, reject) => {
        Utils.invokeContract("role=user,action=view_votes,cid=" + CID, 
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
            onMakeTx(error, result, full);
            resolve(result);
        });
    });
}

const onMakeTx = (err, sres, full, params: {id: number, vote: number} = null, toasted: string = null) => {
    if (err) {
        console.log(err, "Failed to generate transaction request")
    }

    Utils.callApi(
        'process_invoke_data', {data: full.result.raw_data}, 
        (error, result, full) => {
            if (params && params.id) {
                const votes = localStorage.getItem('votes');
                let updatedVotes = [];
                if (votes) {
                    updatedVotes = [...(JSON.parse(votes).votes)];
                }

                updatedVotes.push({id: params.id, txid: result.txid, vote: params.vote});
                
                localStorage.setItem('votes', JSON.stringify({'votes': updatedVotes}));
            }

            if (toasted && !error) {
                const CreatedProposalMsg = (text: string) => (
                    <div>
                      Voting <span style={{fontWeight: 'bold'}}>{text}</span> created
                    </div>
                );

                const text = toasted.length > 50 ? toasted.substring(0, 50) + '...' : toasted;
                toast(CreatedProposalMsg(text));
            }
        }
    )
}