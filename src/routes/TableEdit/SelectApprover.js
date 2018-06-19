import React, {
  Component,
} from 'react';
import {
  connect,
} from 'dva';
import {
  List,
  SearchBar,
} from 'antd-mobile';
import {
  analyzePath,
} from '../../utils/util';
import {
  Nothing,
} from '../../components/index';
import nothing from '../../assets/nothing.png';

import style from './index.less';
import styles from '../common.less';

class SelectStep extends Component {
  state = {
    init: false,
    id: '',
    approverList: [],
    searchList: [],
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'start/refreshModal',
    });
  }
  componentWillReceiveProps(nextprops) {
    const {
      location,
      start,
    } = nextprops;
    const id = analyzePath(location.pathname, 1);
    const {
      preStepData,
    } = start;
    const step = preStepData.available_steps.find(item => item.id === Number(id));
    const approverList = step ? step.approvers : [];

    const {
      init,
    } = this.state;
    if (!init) {
      this.setState({
        init: true,
        id,
        approverList,
        searchList: approverList,
      });
    }
  }

  getGoupList = (item) => { // 遍历各部门下的数据
    const list = item.data;
    return list.map((its, idx) => {
      const i = idx;
      return (
        <div
          className={style.appro}
          key={i}
          onClick={() => this.choseItem(its, 0)}
        >
          <span
            className={[style.appro_item, item.checked ? style.appro_active : null].join(' ')}
          />
          <div className={style.list_item}>
            <List.Item
              key={i}
              extra={its.department_full_name}
            >
              {its.realname} <List.Item.Brief>{its.position_name}</List.Item.Brief>
            </List.Item>
          </div>
        </div>
      );
    });
  }
  getApproverList = () => {
    const {
      searchList,
    } = this.state;
    if (searchList && !searchList.length) {
      return (
        <Nothing src={nothing} />
      );
    }
    const reasult = [];
    searchList.map((item) => {
      if (!reasult.includes(item.department_id)) {
        reasult.push(item.department_id);
      }
      return item;
    });
    const groupList = reasult.map((item) => {
      const obj = {
        department_id: item,
      };
      const group = searchList.filter(its => its.department_id === item);
      obj.data = group;
      obj.department_name = group[0].department_name;
      return obj;
    });
    return groupList.map((item, idx) => {
      const i = idx;
      return (
        <div
          className={style.appro_list}
          key={i}
        >
          <List renderHeader={item.department_name}>
            {this.getGoupList(item)}
          </List>
        </div>
      );
    });
  }
  choseItem = (el) => { // 选择，type来标志是单选还是多选0:单选，1:多选
    const {
      dispatch,
      start,
      history,
    } = this.props;
    const {
      steps,
    } = start;
    const {
      id,
    } = this.state;
    const newSteps = steps.map((item) => {
      let obj = { ...item,
      };
      if (Number(id) === Number(item.id)) {
        obj = { ...item,
          approvers: { ...el,
          },
        };
      }
      return obj;
    });
    dispatch({
      type: 'start/save',
      payload: {
        key: 'steps',
        value: newSteps,
      },
    });
    history.goBack(-1);
  }
  serachDep = (e) => { // 搜索
    const {
      approverList,
    } = this.state;
    const result = approverList.filter(item => item.realname.indexOf(e) > -1);
    this.setState({
      searchList: result,
    });
  }
  render() {
    return (
      <div className={styles.con}>
        <div className={style.header}>
          <SearchBar
            placeholder="输入审批人名称"
            onChange={this.serachDep}
          />
        </div>
        <div className={styles.con_content}>
          <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>{this.getApproverList()}</div>
        </div>
      </div>
    );
  }
}
export default connect(({
  start,
  loading,
}) => ({
  start,
  loading,
}))(SelectStep);