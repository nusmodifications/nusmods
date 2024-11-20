import axios, { AxiosResponse } from 'axios';
import { shallow, ShallowWrapper } from 'enzyme';
import { Maximize2, Minimize2 } from 'react-feather';

import { waitFor } from 'test-utils/async';
import Modal from 'views/components/Modal';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ShareTimetable, { SHORT_URL_KEY } from './ShareTimetable';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('ShareTimetable', () => {
  const MOCK_SHORTURL = 'https://shorten.nusmods.com';

  // Mock Axios to stop it from firing API requests
  beforeEach(() => {
    jest.spyOn(axios, 'put').mockResolvedValue({
      data: { [SHORT_URL_KEY]: MOCK_SHORTURL },
      config: {},
      status: 200,
      headers: {},
      statusText: 'Ok',
    });
  });

  afterEach(() => {
    mockAxios.put.mockRestore();
  });

  const timetable = {
    CS1010S: {
      Lecture: '1',
    },
  };

  const openModal = (wrapper: ShallowWrapper) => wrapper.find('button').first().simulate('click');
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
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );
    expect(mockAxios.put).not.toHaveBeenCalled();

    openModal(wrapper);
    expect(wrapper.find(Modal).exists()).toBe(true);
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
  });

  test('should cache short URL from the API', () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    // Open, close and open the modal again
    openModal(wrapper);
    closeModal(wrapper);
    openModal(wrapper);

    // The second open should not cause a second call
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    closeModal(wrapper);

    // Changing the timetable should cause opening the modal to trigger another API call
    wrapper.setProps({ timetable: { CS3216: { Lecture: '1' } } });
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    openModal(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(2);
    closeModal(wrapper);

    // Changing the semester should also trigger another API call
    wrapper.setProps({ semester: 2 });
    expect(mockAxios.put).toHaveBeenCalledTimes(2);
    openModal(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(3);
  });

  test('should show spinner when loading', () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    openModal(wrapper);
    expect(wrapper.find(LoadingSpinner).exists()).toBe(true);
  });

  test('should display shortUrl with show original url button if available', async () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    await openAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toEqual(MOCK_SHORTURL);
    expect(wrapper.find(Maximize2).exists()).toBe(true);
  });

  test('should display long URL if data is corrupted', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    await openAndWait(wrapper);

    expect(wrapper.find('button').at(1).prop('disabled')).toBe(true);
    expect(wrapper.find('input').prop('value')).toBeTruthy();
  });

  test('should display long URL if the endpoint returns an error', async () => {
    mockAxios.put.mockRejectedValue(new Error());
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    await openAndWait(wrapper);

    expect(wrapper.find('button').at(1).prop('disabled')).toBe(true);
    expect(wrapper.find('input').prop('value')).toBeTruthy();
  });

  test('should not include hidden key in long URL if there are no hidden modules', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    await openAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).not.toContain('hidden');
  });

  test('should include hidden key in long URL if there are hidden modules', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={['CS1010S', 'CS1231S']} />,
    );

    await openAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toContain('hidden=CS1010S,CS1231S');
  });

  test('should change to original url and display shorten url button when clicked on show original url button', async () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} />,
    );

    await openAndWait(wrapper);
    expect(wrapper.find('input').prop('value')).toEqual(MOCK_SHORTURL);
    expect(wrapper.find(Maximize2).exists()).toBe(true);

    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find(Maximize2).exists()).toBe(false);
    expect(wrapper.find(Minimize2).exists()).toBe(true);
    expect(wrapper.find('input').prop('value')).not.toBe(MOCK_SHORTURL);
  });
});
