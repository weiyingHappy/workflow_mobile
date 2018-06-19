import React, {
  Component,
} from 'react';
import {
  connect,
} from 'dva';
import {
  List,
  Toast,
  Button, Modal,
} from 'antd-mobile';
import style from './index.less';
import styles from '../common.less';

const { prompt } = Modal;
class SelectStep extends Component {
  state = {
    steps: [],
    preStepData: null,
    init: false,
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'start/refreshModal',
    });
  }

  componentWillReceiveProps(nextprops) {
    const {
      start,
    } = nextprops;
    const {
      preStepData,
      steps,
    } = start;
    const {
      init,
    } = this.state;
    let step = null;
    if (steps && !steps.length && !init) { // 当steps还没有被初始化过，里面为[]
      step = (preStepData.available_steps || []).map((item) => {
        const obj = {
          id: item.id,
          name: item.name,
          checked: preStepData.concurrent_type === 2, // 是否被选择
          approvers: {},
        };
        return obj;
      });
    }
    this.setState({
      steps: step || steps,
      init: true,
      preStepData,
    });
  }

  getSteps = () => { // 生成步骤
    const {
      steps,
    } = this.state;
    return steps.map((item, i) => {
      const idx = i;
      return (
        <div
          className={style.step}
          key={idx}
        >
          <span
            className={[style.step_item, item.checked ? style.step_active : null].join(' ')}
            onClick={() => this.choseItem(item)}
          />
          <div className={style.list_item}>
            <List.Item
              extra={item.approvers.realname ? item.approvers.realname : '请选择'}
              arrow="horizontal"
              onClick={() => this.choseApprover(item)}
            >
              {item.name}
            </List.Item>
          </div>
        </div>
      );
    });
  }
  choseApprover = (el) => { // 去选择审批人
    const {
      history,
      dispatch,
    } = this.props;
    const {
      steps,
    } = this.state;
    dispatch({
      type: 'start/save',
      payload: {
        key: 'steps',
        value: steps,
      },
    });
    history.push(`/select_approver/${el.id}`);
  }

  choseItem = (el) => { // 选择某项
    const {
      steps,
      preStepData,
    } = this.state;
    let newSteps = [...steps];
    if (preStepData.concurrent_type === 0) {
      newSteps = steps.map((item) => {
        const obj = {
          ...item,
          checked: item.id === el.id ? !item.checked : false,
        };
        return obj;
      });
    } else if (preStepData.concurrent_type === 1) {
      newSteps = steps.map((item) => {
        const obj = {
          ...item,
          checked: item.id === el.id ? !item.checked : item.checked,
        };
        return obj;
      });
    }
    this.setState({
      steps: newSteps,
    });
  }

  submitStep = (v) => { // 提交步骤
    const {
      dispatch,
      history,
      start: { preType },
    } = this.props;
    const {
      steps,
      preStepData,
    } = this.state;
    const checkedSteps = steps.filter(item => item.checked);
    const errMsg = [];
    const nextSteps = checkedSteps.map((item) => {
      const obj = {};
      if (Object.keys(item.approvers).length) {
        obj.step_id = item.id;
        obj.approver_sn = item.approvers.staff_sn;
        obj.approver_name = item.approvers.realname;
        return obj;
      } else {
        errMsg.push(`请选择${item.name}的审批人`);
      }
      return obj;
    });
    if (errMsg.length) {
      errMsg.map((item, i) => {
        setTimeout(() => {
          Toast.fail(item);
        }, (i) * 1000);
        return item;
      });
      return;
    }
    const params = {
      step_run_id: preStepData.step_run_id,
      timestamp: preStepData.timestamp,
      next_step: [...nextSteps],
    };
    dispatch({
      type: 'start/save',
      payload: {
        key: 'steps',
        value: steps,
      },
    });
    if (preType === 'start') {
      dispatch({
        type: 'start/stepStart',
        payload: {
          data: {
            ...params,
          },
          id: preStepData.flow_id,
          cb: () => {
            history.replace('/start_list');
          },
        },
      });
    } else {
      dispatch({
        type: 'approve/getThrough',
        payload: {
          data: {
            ...params,
            remark: v,
          },
          id: preStepData.flow_id,
          cb: () => {
            history.replace('/approvelist');
          },
        },
      });
    }
  }
  render() {
    const {
      preStepData,
    } = this.state;
    const { start: { preType } } = this.props;
    const info = preStepData ? (preStepData.concurrent_type === 0 ? '（请任选一个步骤）' : preStepData.concurrent_type === 2 ? '（请选择全部步骤）' : '') : '';
    return (
      <div className={styles.con}>
        <div className={styles.con_content}>
          <List renderHeader={() => <span>执行步骤<a style={{ color: 'red' }}>{info}</a></span>}>
            {this.getSteps()}
          </List>
        </div>
        <div className={styles.footer}>

          {preType === 'start' ?

            <a onClick={this.submitStep}><span>提交</span></a> : (
              <Button onClick={() => prompt('填写备注', '',
              [
                {
                  text: '取消',
                  onPress: this.submitStep,
                },
                {
                  text: '确定',
                  onPress: this.submitStep,
                },
              ], 'default', null, ['input your name'])}
              >提交
              </Button>
)}

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