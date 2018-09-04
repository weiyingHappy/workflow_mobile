import React from 'react';
// import classNames from 'classnames';
import { connect } from 'dva';
import {
  List, Picker, TextareaItem,
} from 'antd-mobile';
import style from './index.less';
import { isJSON } from '../../utils/util';
import districtTree from '../../utils/district.json';
import district from '../../utils/district.js';

const region = ['province_id', 'city_id', 'area_id', 'detail'];
const regionSelect = ['province_id', 'city_id', 'area_id'];
const addressInfo = {
  province_id: '',
  city_id: '',
  area_id: '',
  detail: '',
};
class Region extends React.Component {
  constructor(props) {
    super(props);
    const { data: { value } } = props;
    const newAddress = { ...addressInfo, ...(value || {}) };
    this.state = {
      address: newAddress,
    };
  }

  onHandlePickerChange = (e) => {
    const { address } = this.state;
    const obj = this.reverseValidValue(e);
    const newAddress = {
      ...address, ...obj,
    };
    this.onChangeCallback(newAddress);
  }

  onHandleChange = (e) => {
    const { address } = this.state;
    const newAddress = {
      ...address, detail: e,
    };
    this.onChangeCallback(newAddress);
  }

  onChangeCallback = (value) => {
    const { onChange, field } = this.props;
    this.setState({
      address: value,
    }, () => {
      onChange(value, field);
    });
  }

  makeValidValue = (value) => {
    const keys = Object.keys(value);
    const newValue = [];
    keys.forEach((key) => {
      const text = value[key];
      const index = regionSelect.indexOf(key);
      if (index > -1) {
        newValue.splice(index, 0, text);
      }
    });
    return newValue;
  }

  reverseValidValue = (arr) => {
    const obj = {};
    arr.forEach((item, i) => {
      const key = region[i];
      obj[key] = item;
    });
    return obj;
  }

  renderFormRegion = (value, field) => {
    const newPikerValue = this.makeValidValue(value);
    const { detail } = value;
    const regionLevel = field.region_level;
    return (
      <div>
        <Picker
          cols={regionLevel}
          value={newPikerValue}
          data={districtTree}
          onOk={e => this.onHandlePickerChange(e)
          }
        >
          <List.Item
            arrow="horizontal"
          >
            {field.name}
          </List.Item>
        </Picker>
        <TextareaItem
          clear
          title="详细地址"
          autoHeight
          placeholder="详细地址：如小区、门牌号等"
          onChange={e => this.onHandleChange(e)}
          value={`${detail || ''}`}
        />
      </div>
    );
  }

  renderCurrent = (data) => {
    let newData = null;
    if (typeof data === 'object' && data) {
      newData = data;
    } else {
      newData = isJSON(newData);
    }
    if (newData) {
      const addrSnArray = this.makeValidValue(newData);
      const lastSn = addrSnArray[addrSnArray.length - 1];
      const [lastName] = district.filter(item => `${item.id}` === `${lastSn}`);
      return lastName;
    }
    return '';
  }

  render() {
    const { isEdit, field, data: { value },
      field: { name }, defaultValue } = this.props;
    return isEdit ? (this.renderFormRegion(value, field)) : (
      <div className={style.readonly} >
        <TextareaItem
          title={name}
          autoHeight
          editable={false}
          value={this.renderCurrent(defaultValue)}
        />
      </div>
    );
  }
}
Region.defaultProps = {
  isEdit: true,
  data: {},
};

export default connect()(Region);
