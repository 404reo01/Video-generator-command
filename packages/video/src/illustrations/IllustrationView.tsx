import type { Illustration } from '@mappa/shared';
import type { JSX } from 'react';
import { CodeView } from './CodeView';
import { CompareView } from './CompareView';
import { FlowView } from './FlowView';
import { IconsView } from './IconsView';
import { ListView } from './ListView';
import { NumberView } from './NumberView';

/** Picks the component for an illustration kind. The caller provides the panel around it. */
export function IllustrationView({ illustration, startMs }: { readonly illustration: Illustration; readonly startMs: number }): JSX.Element {
  switch (illustration.kind) {
    case 'list':
      return <ListView illustration={illustration} />;
    case 'flow':
      return <FlowView illustration={illustration} />;
    case 'compare':
      return <CompareView illustration={illustration} startMs={startMs} />;
    case 'code':
      return <CodeView illustration={illustration} />;
    case 'number':
      return <NumberView illustration={illustration} />;
    case 'icons':
      return <IconsView illustration={illustration} />;
  }
}
