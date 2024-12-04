import { shallow } from 'enzyme';
import { addDays } from 'date-fns';
import DayHeader, { HeaderDate } from './DayHeader';
import styles from './DayHeader.scss';

describe(DayHeader, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render one date when one date is specified', () => {
    expect(shallow(<DayHeader date={today} offset={0} />).find(HeaderDate)).toHaveLength(1);
    expect(shallow(<DayHeader date={[today]} offset={0} />).find(HeaderDate)).toHaveLength(1);
  });

  test('render two date when more than one date is specified', () => {
    const wrapperOne = shallow(<DayHeader date={[today, addDays(today, 1)]} offset={0} />);

    const wrapperTwo = shallow(
      <DayHeader date={[today, addDays(today, 1), addDays(today, 2)]} offset={0} />,
    );

    expect(wrapperOne.find(HeaderDate)).toHaveLength(2);
    expect(wrapperTwo.find(HeaderDate)).toHaveLength(2);
  });

  test('render weather when it is specified', () => {
    const wrapper = shallow(<DayHeader date={today} offset={0} forecast="Cloudy" />);

    expect(wrapper.find(`.${styles.weather}`).exists()).toBe(true);
  });
});

describe(HeaderDate, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render title as today if offset is zero', () => {
    const wrapper = shallow(<HeaderDate offset={0}>{today}</HeaderDate>);
    expect(wrapper.text()).toMatch('Today');
  });

  test('render title as tomorrow if offset is one', () => {
    const wrapper = shallow(<HeaderDate offset={1}>{today}</HeaderDate>);
    expect(wrapper.text()).toMatch('Tomorrow');
  });

  test('render date as day of week if offset more than one', () => {
    expect(shallow(<HeaderDate offset={2}>{today}</HeaderDate>)).toMatchInlineSnapshot(`
      <time
        dateTime="2016-11-23T01:00:00.000Z"
      >
        <span
          className="date"
        >
          23rd November
        </span>
         
        Wednesday
      </time>
    `);
    expect(shallow(<HeaderDate offset={3}>{today}</HeaderDate>)).toMatchInlineSnapshot(`
      <time
        dateTime="2016-11-23T01:00:00.000Z"
      >
        <span
          className="date"
        >
          23rd November
        </span>
         
        Wednesday
      </time>
    `);
  });
});
