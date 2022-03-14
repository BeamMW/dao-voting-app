/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { Button, Input, Popup, QuorumInput, Toggle } from '@app/shared/components';
import { IconCancel, IconCreateProposal } from '@app/shared/icons';

import { useDispatch, useSelector } from 'react-redux';
import { selectAppParams, selectTotalsView } from '@app/containers/Main/store/selectors';
import { selectErrorMessage } from '@app/shared/store/selectors';
import { useFormik } from 'formik';
import { fromGroths } from '@core/appUtils';
import { UserDeposit } from '@core/api';
import { css } from '@linaria/core';
import { IconBeamx } from '@app/shared/icons';

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
            width: 14%;

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
        margin-top: 40px;
        width: 100%;
        display: flex;

        > .qourum-part {
            width: 200px;
        }

        > .toggle-part {
            display: flex;
            align-items: center;
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
            margin-left: auto;
            margin-right: 120px;

            > .beamx {
                display: flex;
                align-items: center;

                > span {
                    margin-left: 5px;
                    font-weight: 700;
                    font-size: 20px;
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

const NewProposalButtonsClass = css`
    max-width: 138px !important;
`;

const ContainerStyled = styled.div`
  position: relative;
`;

const TextAreaProposalStyled = styled.textarea`
  width: 100%;
  line-height: 20px;
  color: white;
  font-size: 16px;
  font-weight: normal;
  background-color: rgba(255, 255, 255, .05);
  border: none;
  padding: 12px 15px;
  border-radius: 10px;
  resize: none;
  height: 45px;
  max-height: 100px;
`;

const NewProposalPopup: React.FC<NewProposalPopupProps> = ({ visible, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector(selectErrorMessage());
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
    //validate: (e) => validate(e, setHint),
    onSubmit: (value) => {
        
        onCancel();
    },
  });

  const {
    values, setFieldValue, errors, submitForm,
  } = formik;

  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = "0px";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = scrollHeight + "px";
    }
}, [values.voting_descr]);

  const handleAssetChange = (e: string) => {
    setFieldValue('quorum_limit', e, true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const words = value.split(' ');
    if (words.length <= 50) {
        setFieldValue('voting_title', value, true);
    }
  };

  const handleDescrChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFieldValue('voting_descr', value, true);
  };

  const handleForumLinkChange = () => {

  };

  const handleRefLinkChange = () => {

  };

  return (
    <Popup
      className={newProposalClass}
      visible={visible}
      title="New proposal"
      cancelButton={(
        <Button className={NewProposalButtonsClass} variant="ghost" icon={IconCancel} onClick={onCancel}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button className={NewProposalButtonsClass} variant="regular"
        pallete='green' icon={IconCreateProposal} onClick={submitForm}>
          create
        </Button>
      )}
      onCancel={onCancel}
    >
        <NewProposalForm onSubmit={submitForm}>
            <div className='title-segment'>
                <span className='epoch-part'>
                    <InputTitle>Epoch number *</InputTitle>
                    <div className='epoch-number'>#{appParams.current.iEpoch + 1}</div>
                </span>
                <span className='title-part'>
                    <InputTitle>Voting title *</InputTitle>
                    <Input
                        variant="proposal"
                        label="50 words max."
                        valid={true}
                        value={values.voting_title}
                        onInput={handleTitleChange}
                        className="voting-input"
                    />
                </span>
            </div>
            <div className='full-segment'>
                <InputTitle>Voting description *</InputTitle>
                <ContainerStyled>
                    <TextAreaProposalStyled ref={textareaRef}
                        value={values.voting_descr}
                        onInput={handleDescrChange}
                        className="descr-input"
                    />
                </ContainerStyled>
            </div>
            <div className='quorum-segment'>
                <div className='qourum-part'>
                    <InputTitle>Quorum limit</InputTitle>
                    <QuorumInput
                        onChange={(e) => handleAssetChange(e)}
                        value={values.quorum_limit}
                    />
                </div>
                <span className='toggle-part'>
                    <p className={`toggle-title ${!activeToggle ? 'active' : ''}`}>BEAMX</p>
                    <Toggle className='toggle-elem' value={activeToggle} onChange={() => setActiveToggle((v) => !v)} />
                    <p className={`toggle-title ${activeToggle ? 'active' : ''}`}>% of TVL</p>
                </span>
                <div className='tvl-part'>
                    <InputTitle>Total value locked</InputTitle>
                    <div className='beamx'>
                        <IconBeamx/>
                        <span>{fromGroths(totals.stake_passive)} BEAMX</span>
                    </div>
                </div>
            </div>
            <div className='full-segment'>
                <InputTitle>Forum link *</InputTitle>
                <Input
                    variant="proposal"
                    valid={true}
                    value={values.forum_link}
                    onInput={handleForumLinkChange}
                    className="descr-input"
                />
            </div>
            <div className='full-segment'>
                <InputTitle>Reference link *</InputTitle>
                <Input
                    variant="proposal"
                    valid={true}
                    value={values.ref_link}
                    onInput={handleRefLinkChange}
                    className="descr-input"
                />
            </div>
        </NewProposalForm>
    </Popup>
  );
};

export default NewProposalPopup;
