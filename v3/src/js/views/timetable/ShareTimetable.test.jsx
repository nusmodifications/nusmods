// @flow

import React from 'react';
import axios from 'axios';
import { shallow } from 'enzyme';

import Modal from 'views/components/Modal';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ShareTimetable from './ShareTimetable';

describe('ShareTimetable', () => {
  // Mock axios to stop it from firing API requests
  beforeEach(() => {
    jest.spyOn(axios, 'get')
      .mockReturnValue(Promise.resolve({ data: { shortUrl: '' } }));
  });

  afterEach(() => {
    axios.get.mockRestore();
  });

  const timetable = {
    CS1010S: {
      Lecture: '1',
    },
  };

  const openModal = wrapper => wrapper.find('button').simulate('click');
  const closeModal = wrapper => wrapper.find(Modal).first().props().onRequestClose();

  test('should load short URL when the modal is opened', () => {
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);
    expect(axios.get).not.toHaveBeenCalled();

    openModal(wrapper);
    expect(wrapper.find(Modal).exists()).toBe(true);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should cache short URL from the API', () => {
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

    // Open, close and open the modal again
    openModal(wrapper);
    closeModal(wrapper);
    openModal(wrapper);

    // The second open should not cause a second call
    expect(axios.get).toHaveBeenCalledTimes(1);
    closeModal(wrapper);

    // Changing the timetable should cause opening the modal to trigger another API call
    wrapper.setProps({ timetable: { CS3216: { Lecture: '1' } } });
    expect(axios.get).toHaveBeenCalledTimes(1);
    openModal(wrapper);
    expect(axios.get).toHaveBeenCalledTimes(2);
    closeModal(wrapper);

    // Changing the semester should also trigger another API call
    wrapper.setProps({ semester: 2 });
    expect(axios.get).toHaveBeenCalledTimes(2);
    openModal(wrapper);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  test('should show spinner when loading', () => {
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

    openModal(wrapper);
    expect(wrapper.find(LoadingSpinner).exists()).toBe(true);
  });
});
