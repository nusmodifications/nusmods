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
      Lecture: [0],
    },
  };

  const openModal = (wrapper: ShallowWrapper) => wrapper.find('button').first().simulate('click');
  const closeModal = (wrapper: ShallowWrapper) =>
    wrapper.find(Modal).first().props().onRequestClose!({} as any);
  const shorten = (wrapper: ShallowWrapper) =>
    wrapper.find('button[aria-label="Shorten URL"]').simulate('click');
  const shortenAndWait = async (wrapper: ShallowWrapper) => {
    shorten(wrapper);
    await waitFor(() => {
      wrapper.update();
      return !wrapper.find(LoadingSpinner).exists();
    });
  };

  test('should load short URL when the shorten button is clicked', async () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );
    expect(mockAxios.put).not.toHaveBeenCalled();

    openModal(wrapper);
    expect(wrapper.find(Modal).exists()).toBe(true);
    // Should not call the API until the shorten button is clicked
    expect(mockAxios.put).toHaveBeenCalledTimes(0);
    shorten(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
  });

  test('should cache short URL from the API', async () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    // Open the model, shorten and unshorten again
    openModal(wrapper);
    await shortenAndWait(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    await shortenAndWait(wrapper);

    // The second shorten click should not cause a second call
    await shortenAndWait(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    closeModal(wrapper);

    // Changing the timetable should cause the shorten button to trigger another API call
    wrapper.setProps({ timetable: { CS3216: { Lecture: [0] } } });
    // openModal(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    openModal(wrapper);
    await shortenAndWait(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(2);
    shorten(wrapper);
    closeModal(wrapper);

    // Changing the semester should also trigger another API call
    wrapper.setProps({ semester: 2 });
    expect(mockAxios.put).toHaveBeenCalledTimes(2);
    openModal(wrapper);
    await shortenAndWait(wrapper);
    expect(mockAxios.put).toHaveBeenCalledTimes(3);
  });

  test('should show spinner when loading', () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    openModal(wrapper);
    shorten(wrapper);
    expect(wrapper.find(LoadingSpinner).exists()).toBe(true);
  });

  test('should display shortUrl with show original url button if available', async () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toEqual(MOCK_SHORTURL);
    expect(wrapper.find(Maximize2).exists()).toBe(true);
  });

  test('should display long URL if data is corrupted', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);

    expect(wrapper.find('button').at(1).prop('disabled')).toBe(true);
    expect(wrapper.find('input').prop('value')).toBeTruthy();
  });

  test('should display long URL if the endpoint returns an error', async () => {
    mockAxios.put.mockRejectedValue(new Error());
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);

    expect(wrapper.find('button').at(1).prop('disabled')).toBe(true);
    expect(wrapper.find('input').prop('value')).toBeTruthy();
  });

  test('should not include hidden key in long URL if there are no hidden modules', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).not.toContain('hidden');
  });

  test('should include hidden key in long URL if there are hidden modules', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable
        semester={1}
        timetable={timetable}
        hiddenModules={['CS1010S', 'CS1231S']}
        taModules={[]}
      />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toContain('hidden=CS1010S,CS1231S');
  });

  test('should include TA key in long URL if there are TA modules', async () => {
    mockAxios.put.mockResolvedValue({} as AxiosResponse); // No short URL
    const wrapper = shallow(
      <ShareTimetable
        semester={1}
        timetable={timetable}
        hiddenModules={[]}
        taModules={['CS1010S']}
      />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);

    expect(wrapper.find('input').prop('value')).toContain('ta=CS1010S');
  });

  test('should change to original url and display shorten url button when clicked on show original url button', async () => {
    const wrapper = shallow(
      <ShareTimetable semester={1} timetable={timetable} hiddenModules={[]} taModules={[]} />,
    );

    openModal(wrapper);
    await shortenAndWait(wrapper);
    expect(wrapper.find('input').prop('value')).toEqual(MOCK_SHORTURL);
    expect(wrapper.find(Maximize2).exists()).toBe(true);

    await shortenAndWait(wrapper);
    expect(wrapper.find(Maximize2).exists()).toBe(false);
    expect(wrapper.find(Minimize2).exists()).toBe(true);
    expect(wrapper.find('input').prop('value')).not.toBe(MOCK_SHORTURL);
  });
});
