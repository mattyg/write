import { BlockToolConstructable } from "@editorjs/editorjs";
import { AppWebsocket, AdminWebsocket } from "@holochain/client";

export interface EditorjsBlock {
    id: string,
    type: string,
    data: any,

}

export interface EditorJsPadContent {
    time: number,
    version: string,
    blocks: EditorjsBlock[]
}

export interface ToolConstructableApplet {
    appletRenderers: (appWebsocket: AppWebsocket) => BlockToolConstructable;
}