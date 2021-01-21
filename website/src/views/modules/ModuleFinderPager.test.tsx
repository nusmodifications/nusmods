import { shallow } from 'enzyme';
import { noop } from 'lodash';
import { mockWindowMatchMedia, mockDomReset } from 'test-utils/mockDom';
import ModuleFinderPagerButton from 'views/modules/ModuleFinderPagerButton';
import ModuleFinderPager, { displayPageRange } from './ModuleFinderPager';

describe(displayPageRange, () => {
  test('calculate page range correctly', () => {
    // One page
    expect(displayPageRange(1, 1, 5)).toEqual({ firstPageNum: 1, lastPageNum: 1 });

    // Fewer pages than requested num of display pages
    expect(displayPageRange(1, 2, 5)).toEqual({ firstPageNum: 1, lastPageNum: 2 });

    // Middle of range
    expect(displayPageRange(500, 1000, 5)).toEqual({ firstPageNum: 498, lastPageNum: 502 });

    // At start of range - should display requested num of display pages
    expect(displayPageRange(1, 100000, 5)).toEqual({ firstPageNum: 1, lastPageNum: 5 });
    expect(displayPageRange(2, 100000, 5)).toEqual({ firstPageNum: 1, lastPageNum: 5 });

    // At end of range - should display half of requested num of display pages
    expect(displayPageRange(10000, 10000, 5)).toEqual({ firstPageNum: 9998, lastPageNum: 10000 });
    expect(displayPageRange(9999, 10000, 5)).toEqual({ firstPageNum: 9997, lastPageNum: 10000 });

    // Even num display pages
    expect(displayPageRange(10, 50, 6)).toEqual({ firstPageNum: 7, lastPageNum: 12 });
  });

  test('edge cases', () => {
    expect(displayPageRange(1, 1, 0)).toBeFalsy();
    expect(displayPageRange(1, 0, 1)).toBeFalsy();
    expect(displayPageRange(0, 1, 1)).toBeFalsy(); // Page nums should always start at 1
  });
});

const DESKTOP = false;
const MOBILE = true;

describe('ModuleFinderPager', () => {
  beforeAll(() => {
    mockWindowMatchMedia();
  });

  afterAll(() => {
    mockDomReset();
  });

  const defaultProps = {
    selectedPage: 1,
    totalNumPages: 1,
    onGoToFirst: noop,
    onGoToPrevious: noop,
    onGoToPage: noop,
    onGoToNext: noop,
    onGoToLast: noop,
  };

  test('should not render if totalNumPages <= 0', () => {
    const zeroPagesPager = shallow(<ModuleFinderPager {...defaultProps} totalNumPages={0} />);
    expect(zeroPagesPager.type()).toEqual(null);

    const negativePagesPager = shallow(<ModuleFinderPager {...defaultProps} totalNumPages={-1} />);
    expect(negativePagesPager.type()).toEqual(null);
  });

  describe('when on desktop', () => {
    beforeAll(() => {
      mockWindowMatchMedia({ matches: DESKTOP });
    });

    test('should contain pager buttons', () => {
      const onDesktop = shallow(<ModuleFinderPager {...defaultProps} />);
      expect(onDesktop.find(ModuleFinderPagerButton)).toHaveLength(5);
    });

    test('should respond to clicks on buttons', () => {
      const props = {
        ...defaultProps,
        onGoToFirst: jest.fn(),
        onGoToPrevious: jest.fn(),
        onGoToPage: jest.fn(),
        onGoToNext: jest.fn(),
        onGoToLast: jest.fn(),
      };

      const actual = shallow(<ModuleFinderPager {...props} />);
      actual.find(ModuleFinderPagerButton).forEach((n) => n.simulate('click'));
      expect(props.onGoToFirst).toHaveBeenCalled();
      expect(props.onGoToPrevious).toHaveBeenCalled();
      expect(props.onGoToPage).toHaveBeenCalledWith(1);
      expect(props.onGoToNext).toHaveBeenCalled();
      expect(props.onGoToLast).toHaveBeenCalled();
    });
  });

  describe('when on mobile', () => {
    beforeAll(() => {
      mockWindowMatchMedia({ matches: MOBILE });
    });

    test('should contain pager buttons', () => {
      const onMobile = shallow(<ModuleFinderPager {...defaultProps} />);
      expect(onMobile.find(ModuleFinderPagerButton)).toHaveLength(4);
    });

    test('should respond to clicks on buttons', () => {
      const props = {
        ...defaultProps,
        onGoToFirst: jest.fn(),
        onGoToPrevious: jest.fn(),
        onGoToPage: jest.fn(),
        onGoToNext: jest.fn(),
        onGoToLast: jest.fn(),
      };

      const actual = shallow(<ModuleFinderPager {...props} />);
      actual.find(ModuleFinderPagerButton).forEach((n) => n.simulate('click'));
      expect(props.onGoToFirst).toHaveBeenCalled();
      expect(props.onGoToPrevious).toHaveBeenCalled();
      expect(props.onGoToPage).not.toHaveBeenCalled(); // No page buttons
      expect(props.onGoToNext).toHaveBeenCalled();
      expect(props.onGoToLast).toHaveBeenCalled();
    });
  });
});
