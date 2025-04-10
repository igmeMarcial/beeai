/**
 * Copyright 2025 IBM Corp.
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

import { agentKeys } from '#modules/agents/api/keys.ts';
import { useMutation } from '@tanstack/react-query';
import { createProvider } from '..';
import { providerKeys } from '../keys';
import type { CreateProviderResponse } from '../types';

interface Props {
  onSuccess?: (data: CreateProviderResponse) => void;
}

export function useCreateProvider({ onSuccess }: Props = {}) {
  const mutation = useMutation({
    mutationFn: createProvider,
    onSuccess,
    meta: {
      invalidates: [providerKeys.lists(), agentKeys.lists()],
      errorToast: {
        title: 'Error during agents import. Check the files in the URL provided.',
      },
    },
  });

  return mutation;
}
