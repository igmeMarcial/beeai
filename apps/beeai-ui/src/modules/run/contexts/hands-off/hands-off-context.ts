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

import type { TextInput } from '@i-am-bee/beeai-sdk/schemas/text';
import { createContext } from 'react';

import type { Agent } from '#modules/agents/api/types.ts';
import type { TextNotificationLogs } from '#modules/run/api/types.ts';
import type { RunStats } from '#modules/run/types.ts';

export const HandsOffContext = createContext<HandsOffContextValue | undefined>(undefined);

interface HandsOffContextValue {
  agent: Agent;
  input?: TextInput;
  stats?: RunStats;
  logs?: TextNotificationLogs;
  text?: string;
  isPending: boolean;
  onSubmit: (input: string) => Promise<void>;
  onCancel: () => void;
  onReset: () => void;
  onClear: () => void;
}
