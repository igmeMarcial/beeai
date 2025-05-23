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

import { AgentRunProgressNotificationSchema } from '@i-am-bee/acp-sdk/types';
import { outputSchema } from '@i-am-bee/beeai-sdk/schemas/base';
import { z } from 'zod';

export const composeNotificationSchema = AgentRunProgressNotificationSchema.extend({
  params: z.object({
    delta: outputSchema.extend({
      agent_idx: z.number(),
      agent_name: z.string(),
    }),
  }),
});
export type ComposeNotificationSchema = typeof composeNotificationSchema;
export type ComposeNotification = z.infer<ComposeNotificationSchema>;
export type ComposeNotificationDelta = ComposeNotification['params']['delta'];
