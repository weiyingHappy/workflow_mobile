// 发起列表

import React, { Component } from 'react';
import { connect } from 'dva';
import { approvalState } from '../../utils/convert';
import ListControl from '../../components/ListView/ListControl';
import {
  userStorage, getUrlParams, dealFlowTypeOptions,
} from '../../utils/util';
import styles from '../common.less';
import style from './index.less';
import './reset.less';
import { Approve } from '../../common/ListView';

const flowList = userStorage('flowList');
const flowTypeOptions = dealFlowTypeOptions(flowList);
const tabs = {
  all: {
    filterColumns: [
      {
        name: 'flow_type_id',
        type: 'checkBox',
        multiple: true,
        title: '审核环节',
        options: flowTypeOptions,
      },
    ],
  },
  processing: {
    filterColumns: [
      {
        name: 'flow_type_id',
        type: 'checkBox',
        multiple: true,
        title: '审核环节',
        options: flowTypeOptions,
      },
    ],
  },
  approved: {
    filterColumns: [
      {
        name: 'flow_type_id',
        type: 'checkBox',
        title: '审核环节',
        multiple: true,
        options: flowTypeOptions,
      },
    ],
  },
  deliver: {
    filterColumns: [
      {
        name: 'flow_type_id',
        type: 'checkBox',
        title: '审核环节',
        multiple: true,
        options: flowTypeOptions,
      },
    ],
  },
  rejected: {
    filterColumns: [
      {
        name: 'flow_type_id',
        type: 'checkBox',
        title: '审核环节',
        multiple: true,
        options: flowTypeOptions,
      },
    ],
  },
};
const searchColumns = {
  name: 'name',
  defaultValue: '',
};
@connect(({ loading, list, common }) => ({
  loading,
  common,
  lists: list.lists,
}))
export default class StartList extends Component {
  state = {
    type: 'all',
    // shortModal: false,
  }
  componentWillReceiveProps(nextProps) {
    const { location: { search } } = nextProps;
    if (search !== this.props.search) {
      const urlParams = getUrlParams(search);
      const { type = 'all' } = urlParams;
      this.setState({
        type,
      });
    }
  }

  fetchDataSource = (params) => {
    const {
      dispatch,
      location: { pathname },
    } = this.props;
    dispatch({
      type: 'list/getApproList',
      payload: {
        parms: {
          ...params,
        },
        path: pathname,
      },
    });
  }

  redirectTo = (item) => {
    const { history } = this.props;
    history.push(`/approve/${item.id}`);
  }

  renderContent = () => {
    const { lists, location, history } = this.props;
    const { pathname } = location;
    const { type } = this.state;
    const currentDatas = lists[`${pathname}_${type}`].datas;
    const { data } = currentDatas;
    const someProps = {
      location,
      history,
    };
    return (
      <Approve
        dataSource={data}
        type={type}
        {...someProps}
        onHandleClick={value => this.redirectTo(value)}
      />
    );
  }

  render() {
    const { location, history } = this.props;
    const { type } = this.state;
    console.log('type', type);
    const { filterColumns } = tabs[type];
    const someProps = {
      location,
      history,
    };
    return (
      <div className={styles.con}>
        <div className={style.con_list}>
          <ListControl
            tab={approvalState}
            {...someProps}
            type={type}
            filterColumns={filterColumns}
            searchColumns={searchColumns}
            handleFetchDataSource={this.fetchDataSource}
          >
            {this.renderContent()}
          </ListControl>
        </div>
      </div>
    );
  }
}

