import * as React from 'react';
import { FSCore } from '../core';

interface FSHomeProps {
  core: FSCore;
}

export class FSHome extends React.Component<FSHomeProps, any> {
  public render() {
    return (
      <div id="fusion-home" className='theia-navigator-container'>
        <div className="title">
          <p><i className="fa fa-plug fa-fw fa-5x" /></p>
          <p>Fusion Studio</p>
        </div>
        <div className="description">
          <p>There are no servers.</p>
          <p>To start add a new one.</p>
        </div>
        <div className='open-workspace-button-container'>
          <button className='open-workspace-button' title='Connect to a server' onClick={() => this.props.core.execute('connect')}><i className="fa fa-plus fa-fw" /> New Server...</button>
        </div>
      </div>
    );
  }
}