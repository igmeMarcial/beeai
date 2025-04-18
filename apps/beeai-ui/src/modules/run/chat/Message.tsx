/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import clsx from 'clsx';

import { ErrorMessage } from '#components/ErrorMessage/ErrorMessage.tsx';
import { Spinner } from '#components/Spinner/Spinner.tsx';

import { AgentIcon } from '../components/AgentIcon';
import { useChat } from '../contexts/chat';
import classes from './Message.module.scss';
import type { ChatMessage } from './types';
import { UserIcon } from './UserIcon';

interface Props {
  message: ChatMessage;
}

export function Message({ message }: Props) {
  const { agent } = useChat();

  const isUserMessage = message.role === 'user';

  return (
    <li className={clsx(classes.root)}>
      <div className={classes.sender}>
        <div className={classes.senderIcon}>{isUserMessage ? <UserIcon /> : <AgentIcon />}</div>
        <div className={classes.senderName}>{isUserMessage ? 'User' : agent.name}</div>
      </div>

      <div className={classes.body}>
        {!isUserMessage && message.status === 'pending' && !message.content ? (
          <Spinner />
        ) : !isUserMessage && message.error && message.status === 'error' ? (
          <ErrorMessage title="Failed to generate a response message" subtitle={message.error.message} />
        ) : (
          <div className={classes.content}>
            {message.content || <span className={classes.empty}>Message has no content</span>}
          </div>
        )}
      </div>
    </li>
  );
}
