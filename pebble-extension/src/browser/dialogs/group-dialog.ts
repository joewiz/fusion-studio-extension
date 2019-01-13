import { injectable, inject } from "inversify";
import { DialogProps, AbstractDialog, DialogMode, DialogError, Message } from "@theia/core/lib/browser";
import { createError, PebbleError } from "../../classes/error";
import { PebbleGroup, PebbleGroupAttributes, PEBBLE_GROUP_ATTRIBUTE_LABELS } from "../../classes/group";
import { PebbleGroupData, sameGroup } from "../../classes/group";
import { PebbleConnection } from "../../classes/connection";
import { IDialogField, createField } from "../../classes/dialog-field";
import { PebbleTabs } from "../../classes/tabs";
import { createKeys, IKeysElement, addKey, addKeys, IKeys } from "../../classes/keys";
import { Checkbox } from "../../classes/checkbox";

@injectable()
export class PebbleGroupDialogProps extends DialogProps {
  readonly connection?: PebbleConnection;
  readonly acceptButton?: string;
  readonly cancelButton?: string;
  readonly group?: PebbleGroup;
}

export type PebbleGroupDialogResult = PebbleGroupData;

export class PebbleGroupDialog extends AbstractDialog<PebbleGroupDialogResult> {

  protected metadataCounter: number = 0;
  protected readonly managersKeys: IKeysElement = createKeys({});
  protected readonly metadataKeys: IKeysElement = createKeys({});
  protected readonly attributes: { [k: string]: HTMLInputElement } = {};
  protected readonly managers: { [k: string]: Checkbox } = {};
  protected readonly containerDiv: HTMLDivElement = document.createElement('div');
  protected readonly groupname: IDialogField = createField('Group name', '');
  protected readonly tabs: PebbleTabs = new PebbleTabs(['Information', 'Metadata']);

  constructor(
    @inject(PebbleGroupDialogProps) protected readonly props: PebbleGroupDialogProps,
  ) {
    super(props);
    if (props.connection) {
      this.tabs.tabs.forEach(tab => tab.classList.add('vertical-form'));
      this.tabs.tabs[0].appendChild(this.groupname.container);
      
      this.managersKeys.container.classList.add('no-label');
      props.connection.users.forEach(user => {
        this.managers[user] = new Checkbox(user, props.group ? props.group.managers.indexOf(user) > -1 : (props.connection ? user === props.connection.username : false));
        this.managers[user].disabled = !props.group && !!props.connection && user === props.connection.username;
        addKey(user, {
          type: 'string',
          value: '',
          el: this.managers[user].container,
        }, this.managersKeys)
      });
      const label = document.createElement('div');
      label.style.fontWeight = 'bold';
      label.innerText = 'managers';
      this.tabs.tabs[0].appendChild(label);
      this.tabs.tabs[0].appendChild(this.managersKeys.container);
      
      const keys: IKeys = {};
      for (let index in PEBBLE_GROUP_ATTRIBUTE_LABELS) {
        const el = document.createElement('input');
        const i = PEBBLE_GROUP_ATTRIBUTE_LABELS[index] || '';
        keys[i] = {
          type: 'string',
          value: '',
          el,
        };
        this.attributes[index] = el;
      };
      addKeys(keys, this.metadataKeys);
      this.tabs.tabs[1].appendChild(this.metadataKeys.container);
      
      if (props.group) {
        this.groupname.input.value = props.group.groupName;
        this.groupname.input.disabled = true;
        this.writeMetadata(props.group.metadata);
      }
      
      this.containerDiv.appendChild(this.tabs.container);
      this.containerDiv.className = 'dialog-container user-dialog-container';
      this.contentNode.appendChild(this.containerDiv);

      this.appendAcceptButton(props.acceptButton || 'Add');
      this.appendCloseButton(props.cancelButton || 'Cancel');
    } else {
      throw createError(PebbleError.unknown);
    }
  }

  readMetadata(): PebbleGroupAttributes {
    const result: PebbleGroupAttributes = {};
    for (let i in PEBBLE_GROUP_ATTRIBUTE_LABELS) {
      if (this.attributes[i].value) {
        result[i] = this.attributes[i].value;
      }
    }
    return result;
  }
  writeMetadata(metadata: PebbleGroupAttributes) {
    for (let i in PEBBLE_GROUP_ATTRIBUTE_LABELS) {
      this.attributes[i].value = metadata[i] || '';
    }
  }

  get value(): PebbleGroupDialogResult {
    return {
      managers: Object.keys(this.managers).filter(group => this.managers[group].checked),
      metadata: this.readMetadata(),
      groupName: this.groupname.input.value,
    };
  }

  protected isValid(value: PebbleGroupDialogResult, mode: DialogMode): DialogError {
    if (this.props.group) {
      return !sameGroup(value, this.props.group);
    } else {
      return !!value.groupName && value.managers.length > 0;
    }
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.addUpdateListener(this.groupname.input, 'input');
    Object.keys(this.managers).forEach(group => this.addUpdateListener(this.managers[group].container, 'click'));
    Object.keys(this.attributes).forEach(key => this.addUpdateListener(this.attributes[key], 'input'));
  }

  protected onActivateRequest(msg: Message): void {
    this.groupname.input.focus();
  }

}
