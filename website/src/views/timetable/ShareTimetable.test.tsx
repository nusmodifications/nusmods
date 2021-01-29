import axios, { AxiosResponse } from 'axios';
import { shallow, ShallowWrapper } from 'enzyme';

import { enableShortUrl } from 'featureFlags';
import { waitFor } from 'test-utils/async';
import Modal from 'views/components/Modal';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ShareTimetable, { SHORT_URL_KEY } from './ShareTimetable';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('ShareTimetable', () => {
  const MOCK_SHORTURL = 'http://mod.us/short';

  // Mock Axios to stop it from firing API requests
  beforeEach(() => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { [SHORT_URL_KEY]: MOCK_SHORTURL },
      config: {},
      status: 200,
      headers: {},
      statusText: 'Ok',
    });
  });

  afterEach(() => {
    mockAxios.get.mockRestore();
  });

  const timetable = {
    CS1010S: {
      Lecture: '1',
    },
  };

  const openModal = (wrapper: ShallowWrapper) => wrapper.find('button').simulate('click');
  const closeModal = (wrapper: ShallowWrapper) =>
    wrapper.find(Modal).first().props().onRequestClose!({} as any);

  const openAndWait = async (wrapper: ShallowWrapper) => {
    openModal(wrapper);

    await waitFor(() => {
      wrapper.update();
      return wrapper.find('input').exists();
    });
  };

  test('should load short URL when the modal is opened', () => {
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);
    expect(mockAxios.get).not.toHaveBeenCalled();

    openModal(wrapper);
    expect(wrapper.find(Modal).exists()).toBe(true);
    if (enableShortUrl) {
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    } else {
      expect(mockAxios.get).toHaveBeenCalledTimes(0);
    }
  });

  if (enableShortUrl) {
    test('should cache short URL from the API', () => {
      const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

      // Open, close and open the modal again
      openModal(wrapper);
      closeModal(wrapper);
      openModal(wrapper);

      // The second open should not cause a second call
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      closeModal(wrapper);

      // Changing the timetable should cause opening the modal to trigger another API call
      wrapper.setProps({ timetable: { CS3216: { Lecture: '1' } } });
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      openModal(wrapper);
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      closeModal(wrapper);

      // Changing the semester should also trigger another API call
      wrapper.setProps({ semester: 2 });
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      openModal(wrapper);
      expect(mockAxios.get).toHaveBeenCalledTimes(3);
    });

    test('should show spinner when loading', () => {
      const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

      openModal(wrapper);
      expect(wrapper.find(LoadingSpinner).exists()).toBe(true);
    });
  }

  test('should display shortUrl if available', async () => {
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

    await openAndWait(wrapper);

    if (enableShortUrl) {
      expect(wrapper.find('input').prop('value')).toEqual(MOCK_SHORTURL);
    } else {
      expect(wrapper.find('input').prop('value')).toBeTruthy();
    }
  });

  test('should display long URL if data is corrupted', async () => {
    mockAxios.get.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

    await openAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toBeTruthy();
  });

  test('should display long URL if the endpoint returns an error', async () => {
    mockAxios.get.mockRejectedValue(new Error());
    const wrapper = shallow(<ShareTimetable semester={1} timetable={timetable} />);

    await openAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toBeTruthy();
  });
});
