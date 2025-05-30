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

import { useQueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useCreateMCPClient } from '#api/mcp-client/useCreateMCPClient.ts';

import { MCPClientContext } from './mcp-client-context';

export function MCPClientProvider({ children }: PropsWithChildren) {
  const { createClient, client } = useCreateMCPClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    createClient();
  }, [createClient]);

  useEffect(() => {
    if (client) {
      queryClient.invalidateQueries();
    }
  }, [client, queryClient]);

  return <MCPClientContext.Provider value={client}>{children}</MCPClientContext.Provider>;
}
