/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { Button, Input, Popup, Toggle } from '@app/shared/components';
import { IconCancel, IconCreateProposal, IconBeamx } from '@app/shared/icons';

import { useDispatch, useSelector } from 'react-redux';
import { selectAppParams, selectTotalsView } from '@app/containers/Main/store/selectors';
import { selectErrorMessage } from '@app/shared/store/selectors';
import { useFormik } from 'formik';
import { fromGroths } from '@core/appUtils';
import { AddProposal, UserDeposit } from '@core/api';
import { css } from '@linaria/core';
import { ProposalData } from '@app/core/types';
import { BEAMX_TVL, BEAMX_TVL_STR } from '@app/shared/constants/common'

interface NewProposalPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
}

interface NewProposalFormData {
    voting_title: string,
    voting_descr: string,
    quorum_limit: string,
    forum_link: string,
    ref_link: string,
    epoch_num: string
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    valid?: boolean;
}

const REG_AMOUNT = /^\d+$/;
const REG_URL = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;

const newProposalClass = css`
    width: 760px !important;
    padding: 30px !important;
`;

const NewProposalForm = styled.form`

    > .title-segment {
        margin-top: 30px;
        display: flex;
        flex-direction: row;
        width: 100%;

        > .epoch-part {
            width: 20%;

            > .epoch-number {
                padding: 13px;
                background-color: rgba(255, 255, 255, .05);
                border-radius: 10px;
                width: 72px;
                font-size: 16px;
            }
        }

        > .title-part {
            margin-left: auto;
            width: 81%;
        }
    }

    > .full-segment {
        margin-top: 20px;
        width: 100%;
    }

    > .quorum-segment {
        margin-top: 20px;
        width: 100%;
        display: flex;

        > .qourum-part {
            width: 200px;
        }

        > .toggle-part {
            display: flex;
            align-items: center;
            margin-top: 20px;
            margin-left: 10px;

            > .toggle-elem {
                margin: 0 11px;
            }

            > p {
                color: rgba(255, 255, 255, .7);

                &.active {
                    color: #1af6d6;
                }
            }
        }

        > .tvl-part {
            margin-left: 30px;
            margin-right: auto;
            display: flex;
            flex-direction: column;

            > .beamx {
                height: 100%;
                display: flex;
                align-items: center;

                > span {
                    margin-left: 5px;
                    font-weight: 700;
                    font-size: 20px;
                    max-width: 250px;
                    text-align: start;
                    word-wrap: break-word;
                }
            }
        }
    }
`;

const InputTitle = styled.div`
    margin-bottom: 10px;
    font-size: 14px;
    color: #8DA1AD;
    text-align: start;
`;

const TvlTitle = styled.div`
    font-size: 14px;
    color: #8DA1AD;
    text-align: start;
`;

const NewProposalButtonsClass = css`
    max-width: 138px !important;
`;

const ContainerStyled = styled.div`
    position: relative;
`;

const TextAreaProposalStyled = styled.textarea<TextAreaProps>`
    width: 100%;
    line-height: 20px;
    color: white;
    font-size: 16px;
    font-weight: normal;
    background-color: ${({ valid }) => (valid ? 'rgba(255, 255, 255, .05)' : 'rgb(255, 116, 107, .15)')};
    border: none;
    padding: 12px 15px;
    border-radius: 10px;
    resize: none;
    height: 45px;
    max-height: 100px;
`;

const ErrorLineClass = css`
    text-align: start;
    color: #ff746b;
    font-style: italic;
`;

const NewProposalPopup: React.FC<NewProposalPopupProps> = ({ visible, onCancel }) => {
    const appParams = useSelector(selectAppParams());
    const totals = useSelector(selectTotalsView());

    const [activeToggle, setActiveToggle] = useState(false);

    const formik = useFormik<NewProposalFormData>({
        initialValues: {
        voting_title: '',
        voting_descr: '',
        quorum_limit: '',
        forum_link: '',
        ref_link: '',
        epoch_num: ''
        },
        isInitialValid: false,
        onSubmit: (value) => {
            submitHandle();
            onCancel();
            resetForm();
            setActiveToggle(false);
        },
        validate: (e) => validate(e),
    });

    const {
        values, setFieldValue, errors, submitForm, resetForm,
    } = formik;

    const validate = async (formValues: NewProposalFormData) => {
        const errorsValidation: any = {};
        const {
            voting_title, quorum_limit, voting_descr, ref_link, forum_link
        } = formValues;

        if (voting_title.length > 0) {
            const votingTitleCount = voting_title.split(' ').length 
            if (votingTitleCount > 50) {
                errorsValidation.voting_title = 'Too many words.';
            }
        } else {
            errorsValidation.voting_title = 'Required field.'
        }

        if (!REG_AMOUNT.test(quorum_limit) && quorum_limit !== '0' && quorum_limit !== '') {
            errorsValidation.quorum_limit = 'Incorrect amount.';
        } else {
            const quorumValue = parseInt(quorum_limit);
            if (quorumValue > 0) {
                if ((!activeToggle && quorumValue > BEAMX_TVL) ||
                (activeToggle && (quorumValue > 100 || quorumValue < 0))) {
                    errorsValidation.quorum_limit = 'Incorrect amount.'
                }
            }
        }

        if (voting_descr.length === 0) {
            errorsValidation.voting_descr = 'Required field.'
        }

        if (forum_link.length === 0) {
            errorsValidation.forum_link = 'Required field.';
        }
        if (!REG_URL.test(forum_link) && forum_link.length > 0) {
            errorsValidation.forum_link = 'Incorrect link format.';
        }

        if (!REG_URL.test(ref_link) && ref_link.length > 0) {
            errorsValidation.ref_link = 'Incorrect link format.';
        }

        return errorsValidation;
    };

    const textareaRef = useRef(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "0px";
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = scrollHeight + "px";
        }
    }, [values.voting_descr]);

    const submitHandle = () => {
        let newProposal: ProposalData = {
            title: values.voting_title,
            description: values.voting_descr,
            forum_link: values.forum_link,
            ref_link: values.ref_link,
            timestamp: new Date().getTime(),
        }
        const qLimit = parseInt(values.quorum_limit);
        if (qLimit > 0) {
            newProposal.quorum = {
                value: qLimit,
                type: activeToggle ? 'percent' : 'beamx'
            }
        }
        AddProposal(newProposal)
    };

    const isFormDisabled = () => {
        if (!formik.isValid) return !formik.isValid;
        return false;
    };

    const handleQuorumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFieldValue('quorum_limit', value, true);  
    };

    const isQuorumLimitValid = () => {
        if (!REG_AMOUNT.test(values.quorum_limit) && values.quorum_limit !== '0' && values.quorum_limit !== '') {
            return false;
        } else {
            const quorumValue = parseInt(values.quorum_limit);
            if (quorumValue > 0) {
                if ((!activeToggle && quorumValue > BEAMX_TVL) ||
                (activeToggle && (quorumValue > 100 || quorumValue < 0))) {
                    return false;
                }
            }
        }

        return true;
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFieldValue('voting_title', value, true);
    };

    const isTitleValid = () => {
        //const words = values.voting_title.split(' ');
        //if (words.length > 0 && words.length <= 50) return true;
        return !errors.voting_title
    };

    const handleDescrChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFieldValue('voting_descr', value, true);
    };

    const isDescriptionValid = () => {
        //const descr = values.voting_descr;
        //if (descr.length > 0) return true;
        return !errors.voting_descr;
    }

    const handleForumLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFieldValue('forum_link', value, true);
    };

    const isForumLinkValid = () => {
        return !errors.forum_link;
    }

    const handleRefLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFieldValue('ref_link', value, true);
    };

    const isRefLinkValid = () => {
        return !errors.ref_link;
    }

  return (
    <Popup
      className={newProposalClass}
      visible={visible}
      title="New proposal"
      cancelButton={(
        <Button className={NewProposalButtonsClass} variant="ghost" icon={IconCancel} onClick={() => {
            onCancel();
            //resetForm();
            setActiveToggle(false);
        }}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button className={NewProposalButtonsClass} variant="regular"
        pallete='green' icon={IconCreateProposal} disabled={isFormDisabled()} onClick={() => {
            submitForm();
        }}>
          create
        </Button>
      )}
      onCancel={() => {
        onCancel();
        //resetForm();
        setActiveToggle(false);
    }}
    >
        <NewProposalForm onSubmit={submitForm}>
            <div className='title-segment'>
                <span className='epoch-part'>
                    <InputTitle>Epoch number *</InputTitle>
                    <div className='epoch-number'>#{appParams.current.iEpoch + 1}</div>
                </span>
                <span className='title-part'>
                    <InputTitle>Proposal title *</InputTitle>
                    <Input
                        variant="proposal"
                        label="50 words max."
                        valid={isTitleValid()}
                        value={values.voting_title}
                        onInput={handleTitleChange}
                        className="voting-input"
                    />
                    <div className={ErrorLineClass}>{errors.voting_title}</div>
                </span>
            </div>
            <div className='full-segment'>
                <InputTitle>Proposal description *</InputTitle>
                <ContainerStyled>
                    <TextAreaProposalStyled ref={textareaRef}
                        value={values.voting_descr}
                        valid={isDescriptionValid()}
                        onInput={handleDescrChange}
                        className="descr-input"
                    />
                    <div className={ErrorLineClass}>{errors.voting_descr}</div>
                </ContainerStyled>
            </div>
            <div className='quorum-segment'>
                <div className='qourum-part'>
                    <InputTitle>Quorum limit</InputTitle>
                    <Input
                        variant="proposal"
                        valid={isQuorumLimitValid()}
                        onInput={handleQuorumChange}
                        value={values.quorum_limit}
                    />
                    <div className={ErrorLineClass}>{errors.quorum_limit}</div>
                </div>
                <span className='toggle-part'>
                    <p className={`toggle-title ${!activeToggle ? 'active' : ''}`}>BEAMX</p>
                    <Toggle className='toggle-elem' value={activeToggle} onChange={() => setActiveToggle((v) => {
                        values.quorum_limit = '';
                        return !v;
                    })} />
                    <p className={`toggle-title ${activeToggle ? 'active' : ''}`}>% of TVL</p>
                </span>
                <div className='tvl-part'>
                    <TvlTitle>Total supply</TvlTitle>
                    <div className='beamx'>
                        <IconBeamx/>
                        <span>{BEAMX_TVL_STR} BEAMX</span>
                    </div>
                </div>
            </div>
            <div className='full-segment'>
                <InputTitle>Forum link *</InputTitle>
                <Input
                    variant="proposal"
                    valid={isForumLinkValid()}
                    value={values.forum_link}
                    onInput={handleForumLinkChange}
                    className="descr-input"
                />
                <div className={ErrorLineClass}>{errors.forum_link}</div>
            </div>
            <div className='full-segment'>
                <InputTitle>Reference link</InputTitle>
                <Input
                    variant="proposal"
                    valid={isRefLinkValid()}
                    value={values.ref_link}
                    onInput={handleRefLinkChange}
                    className="descr-input"
                />
                <div className={ErrorLineClass}>{errors.ref_link}</div>
            </div>
        </NewProposalForm>
    </Popup>
  );
};

export default NewProposalPopup;
