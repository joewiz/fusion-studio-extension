/**
 * Generated using theia-extension-generator
 */

import { ResourceResolver } from "@theia/core/lib/common";

import { ContainerModule } from "inversify";
import { FSResourceResolver } from '../browser/resource';
import { FSViewWidgetFactory } from './widget/main';
import { FSEvalWidgetFactory } from "./widget/eval";
import { WidgetFactory, bindViewContribution, WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { FSViewService, createFSViewWidget } from './view-service';
import { createFSEvalWidget, FSEvalService } from "./eval-service";
import { FSContribution } from "./contribution";
import { FSEvalContribution } from "./eval-contribution";
import { FSCore } from "./core";
import { DragController } from "./widget/drag";
import { FSFiles, FSFilesePath } from "../classes/files";
import { LanguageGrammarDefinitionContribution } from "@theia/monaco/lib/browser/textmate";
import { XQueryGrammaribution } from "./language-contribution";

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {

  bind(FSFiles).toDynamicValue(ctx => {
    const provider = ctx.container.get(WebSocketConnectionProvider);
    return provider.createProxy<FSFiles>(FSFilesePath);
  }).inSingletonScope();

  bind(FSViewWidgetFactory).toFactory(ctx =>
    () => createFSViewWidget(ctx.container)
  );
  bind(FSEvalWidgetFactory).toFactory(ctx =>
    () => createFSEvalWidget(ctx.container)
  );

  bind(FSViewService).toSelf().inSingletonScope();
  bind(WidgetFactory).toDynamicValue(context => context.container.get(FSViewService));
  bind(FSEvalService).toSelf().inSingletonScope();
  bind(WidgetFactory).toDynamicValue(context => context.container.get(FSEvalService));

  bindViewContribution(bind, FSContribution);
  bindViewContribution(bind, FSEvalContribution);

  bind(FSCore).toSelf().inSingletonScope();
  bind(DragController).toSelf().inSingletonScope();
  
  bind(FSResourceResolver).toSelf().inSingletonScope();
  bind(ResourceResolver).toService(FSResourceResolver);
  bind(LanguageGrammarDefinitionContribution).to(XQueryGrammaribution).inSingletonScope();
  
});