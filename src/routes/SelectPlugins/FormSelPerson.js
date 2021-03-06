import React, { Component } from 'react';
import {
  connect,
} from 'dva';
import { PersonContainer, Nothing } from '../../components/index';
import { Department, Staff, SeStaff } from '../../common/ListView/index.js';
import { makeFieldValue, makeBreadCrumbData, getUrlParams, dealCheckAll, setNavTitle } from '../../utils/util';
import styles from '../common.less';
import style from './index.less';

@connect(({ formSearchStaff, loading }) => ({
  formSearchStaff,
  department: formSearchStaff.department,
  staff: formSearchStaff.staff,
  finalStaff: formSearchStaff.finalStaff,
  searStaff: formSearchStaff.searStaff,
  breadCrumb: formSearchStaff.breadCrumb,
  globalLoading: loading.global,
  loading: loading.effects['formSearchStaff/fetchFirstDepartment'],
  searchLoding: loading.effects['formSearchStaff/serachStaff'],
}))
export default class SelPerson extends Component {
  constructor(props) {
    super(props);
    const state = this.getInitState();
    this.state = {
      ...state,
    };
  }

  componentWillMount() {
    this.fetchDataSource();
    setNavTitle('选择员工');
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onSearch = (search = '') => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.setState({
      search,
      page: 1,
    });
    if (search) {
      this.timer = setInterval(() => {
        this.onSearchSubmit(search.trim());
      }, 500);
    }
  }

  onSearchSubmit = (search) => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const { params: { id }, page } = this.state;
    const currentParams = {
      field_id: id,
      page,
      pagesize: 15,
      filters: {
        realname: { like: search },
      },
    };
    this.fetchPageDataSource(currentParams);
  }

  onPageChange = () => {
    const { search, params: { id }, page } = this.state;
    this.setState({
      page: page + 1,
    });
    const currentParams = {
      field_id: id,
      page: page + 1,
      pagesize: 15,
      filters: {
        realname: { like: search },
      },
    };
    this.fetchPageDataSource(currentParams);
  }

  onRefresh = () => {
    const { search } = this.state;
    this.setState({
      page: 1,
    }, () => {
      this.onSearchSubmit(search);
    });
  }

  getSelectResult = (result) => {
    const { selected, params: { type } } = this.state;
    if (`${type}` !== '1') {
      this.getSingleSelect(result);
    } else {
      const newResult = result.map((item) => {
        const obj = { ...item };
        obj.staff_name = item.realname || item.staff_name;
        return obj;
      });
      this.setState({
        selected: {
          ...selected,
          data: newResult,
          num: newResult.length,
        },
      });
    }
  }

  getSingleSelect = (result) => {
    const { params: { key } } = this.state;
    const { history, formSearchStaff: { currentKey } } = this.props;
    const current = { ...currentKey[`${key}`] || {} };
    const { cb } = current;
    const newSelectstaff = result;
    if (cb) {
      cb(newSelectstaff);
    }
    history.goBack(-1);
  }

  getInitState = () => {
    const { formSearchStaff: { currentKey } } = this.props;
    const urlParams = getUrlParams();
    const paramsValue = urlParams.params;
    const params = JSON.parse(paramsValue);
    const { key, type, max, min } = params;
    const multiple = !!type;
    const current = currentKey[`${key}`] || {};
    const data = current.data || (multiple ? [] : {});
    // const newData = makeFieldValue(data, { value: 'staff_sn', text: 'realname' }, multiple);
    let newData = [];
    if (!multiple && !Object.keys(data || {}).length) {
      newData = {};
    } else {
      newData = makeFieldValue(data, { value: 'staff_sn', text: 'realname' }, multiple);
    }
    let mutiData = [];
    if (multiple) {
      mutiData = newData;
    }
    const singleSelected = multiple ? {} : newData;
    const obj = {
      selected: {
        data: mutiData,
        total: max || 50,
        num: mutiData.length,
        min: min || 1,
      },
      singleSelected,
      params,
      page: 1,
      search: '',
      // key, // 选的什么人
      // type, // 选的类型，单选还是多选
      multiple,
    };
    return obj;
  }

  makeBreadCrumb = (params) => {
    const { breadCrumb } = this.props;
    return makeBreadCrumbData(params, breadCrumb, 'id');
  }

  selDepartment = (data) => {
    const { params } = this.state;
    const fieldId = params.id;
    const newBread = this.makeBreadCrumb(data);
    const parentId = data.id;
    let payload = null;
    if (`${parentId}` !== '-1') {
      payload = {
        breadCrumb: newBread,
        reqData: { field_id: fieldId, department_id: parentId },
      };
    }
    this.fetchDataSource(payload);
  }

  fetchDataSource = (payload) => {
    const { dispatch } = this.props;
    const { params } = this.state;
    const fieldId = params.id;
    let newParams = {};
    if (payload) {
      newParams = { ...payload };
    } else {
      newParams = {
        breadCrumb: [{ name: '联系人', id: '-1' }],
        reqData: { field_id: fieldId },
      };
    }
    dispatch({
      type: 'formSearchStaff/fetchFirstDepartment',
      payload: { ...newParams },
    });
  }

  fetchPageDataSource = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'formSearchStaff/serachStaff',
      payload: params,
    });
  }

  checkedAll = (selectAll) => { // 全选
    const { staff } = this.props;
    const staffSn = staff.map(item => item.staff_sn);
    const { selected, params: { max } } = this.state;
    const newSelected = dealCheckAll(selected, staffSn, 'staff_sn', selectAll, staff, max);
    this.setState({
      selected: newSelected,
    });
  }

  searchOncancel = () => {
    this.setState({
      search: '',
      page: 1,
    });
    const { breadCrumb } = this.props;
    if (breadCrumb && breadCrumb.length) {
      this.selDepartment(breadCrumb[breadCrumb.length - 1]);
    }
  }

  selectOk = () => {
    const { history, formSearchStaff: { currentKey } } = this.props;
    const { params, selected } = this.state;
    const { key } = params;
    const current = { ...currentKey[`${key}`] || {} };
    const { cb } = current;
    const newSelectstaff = selected.data;
    if (cb) {
      cb(newSelectstaff);
    }
    history.goBack(-1);
  }

  render() {
    const {
      department,
      staff, searStaff,
      breadCrumb, dispatch,
      loading, globalLoading,
      history, location,
    } = this.props;
    const someProps = {
      location,
      history,
      dispatch,
    };
    const { selected, search, singleSelected, multiple, page } = this.state;
    const selectedData = selected.data;
    const { totalpage, data = [] } = searStaff;
    const staffSn = staff.map(item => `${item.staff_sn}`);
    const checkAble = !!(selectedData.filter(item =>
      staffSn.indexOf(`${item.staff_sn}`) > -1).length === staffSn.length && staffSn.length);

    return (
      <div className={[styles.con, style.sel_person].join(' ')}>
        <PersonContainer
          multiple={multiple}
          name="realname"
          all={false}
          bread={breadCrumb}
          singleSelected={singleSelected}
          checkAble={checkAble}
          selected={selected}
          ableSelectAll={!search}
          checkedAll={this.checkedAll}
          handleSearch={this.onSearch}
          search={search}
          handleBread={this.selDepartment}
          fetchDataSource={() => this.fetchDataSource()}
          selectOk={this.selectOk}
          handleDelete={this.getSelectResult}
          searchOncancel={this.searchOncancel}
        >
          <div
            style={{ ...(loading ? { display: 'none' } : null) }}
          >
            {department.length && !search ? (
              <Department
                onRefresh={false}
                dataSource={department}
                heightNone
                hasLoading
                fetchDataSource={this.selDepartment}
                name="id"
              />
            ) : null}
            {(((!search && !staff.length && !department.length))
              && !globalLoading) ? <Nothing /> : null}
            {!search ? (
              <Staff
                link=""
                heightNone
                onRefresh={false}
                name="staff_sn"
                renderName="realname"
                hasLoading
                singleSelected={singleSelected}
                multiple={multiple}
                selected={selected.data}
                dataSource={staff}
                onChange={this.getSelectResult}
              />
            ) : null}
            {search ? (
              <SeStaff
                {...someProps}
                link=""
                name="staff_sn"
                renderName="realname"
                page={page}
                totalpage={totalpage}
                onPageChange={this.onPageChange}
                multiple={multiple}
                singleSelected={singleSelected}
                selected={selected.data}
                dataSource={data}
                onRefresh={this.onRefresh}
                onChange={this.getSelectResult}
              />
            ) : null}

          </div>

        </PersonContainer>
      </div>
    );
  }
}
