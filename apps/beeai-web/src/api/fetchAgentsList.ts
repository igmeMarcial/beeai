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

import { Agent } from '@i-am-bee/beeai-ui';

import { fetchAgentMetadata } from '@/utils/fetchAgentMetadata';
import { fetchAgentRegistry } from '@/utils/fetchAgentRegistry';

export async function fetchAgentsList() {
  const registry = await fetchAgentRegistry();
  const { providers } = registry;
  const agents = await Promise.all(
    providers.map(async ({ location }) => await fetchAgentMetadata({ dockerImageId: location })),
  );

  /* The agents actually lack inputSchema and outputSchema, but we don't use them anywhere, so we can use type assertion. */
  return agents as Agent[];
}
