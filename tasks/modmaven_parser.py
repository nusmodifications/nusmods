import re

# List of operators
operators = [' and ', ' or ']

# Default Value for Comma when nothing is specified
# A, B ==> A and B
default_comma_op = ' and '

# Precedence of Operators (0 ==> lowest)
_pre = {' and ': 0, ' or ': 1}

mod_string = '(?:[A-Z]{2,3}|MUT |CE |ME |MUA )[0-9]{4}(?:[A-Z]|[A-Z]R)?'
verify_re = re.compile(mod_string)
mod_re = re.compile(mod_string + '|' + '|'.join(operators) + '|[\(\)\[\]\{\}]')
paren_re = re.compile('[\{\}\[\]]')
slash_re = re.compile('[/]')
colon_re = re.compile(';')
and_re = re.compile('&')
comma_re = re.compile(mod_string + '\)?, ')
comma_fix_re = re.compile(mod_string + '\)?, |' + '|'.join(operators))

# Add any Key-words for which NO parsing should be done and the entire
# pre-req string should be shown instead
restricted = ['USP', 'Cohort', 'AY20', 'H2 ', 'Qualifying English Test', 'grade', 'Grade', 'H1 ', 'A-level', '(PL3232 - PL3236)']
restricted_re = re.compile('|'.join(restricted))

# Add any special Exceptions here in the following format
# The specified value will be shown if the given key is encountered
# as a prereq
# key = EXACT pre-requisite string to match
# value = parsed output
exceptions = {
    'CS3241, PC1221, MA1521and MA1101R': {' and ': ['CS3241', 'PC1221', 'MA1521', 'MA1101R']},
    'RE4221 ADVANCED URBAN PLANNING THEORIES, RE4222 PUBLIC POLICY AND REAL ESTATE MARKETS.':
        {' and ': ['RE4221', 'RE4222']},
    'Pass 80 MCs and [CS3240, IS2150, IS3230 and IS3150]': {' and ': ['CS3240', 'IS2150', 'IS3230', 'IS3150']},
    'CS2261 or IS2103 (applicable to intakes from AY2005/06 to AY2007/08) or [(CS2261 or IS2103) and (CS2301 or IS2101)] (applicable to intakes from AY2008/09 onwards)':
        {' and ': ['IS2103', 'IS2101']},
    'For Applied Chemistry Students: Polymer Chemistry II (CM3265). For Chemistry students: Organic Reaction Mechanisms (CM3221).':
        'For Applied Chemistry Students: Polymer Chemistry II (CM3265). For Chemistry students: Organic Reaction Mechanisms (CM3221).',
    'Pass ID 2105 & 2106': {' and ': ['ID2105', 'ID2106']},
    'Pass ID 1105 & 1106': {' and ': ['ID1105', 'ID1106']},
    'Pass ID 3105 & 3106': {' and ': ['ID3105', 'ID3106']},
    'ME21234 Fluid Mechanics I ME2114 Mechanics of Materials II': {' and ': ['ME2134', 'ME2114']},
    'LAK3202 Korean 4, LAK3203 Korean for Academic Purposes or by placement test.': {' or ': ['LAK3202', 'LAK3203']},
    'SOC students: CS1020 or its equivalent; Other students:NM2217 or NM3209 or the prerequisites for SoC students': {' or ': ['CS1020', 'NM2217', 'NM3209']}
}

def precedence(val, stack):
    return _pre[val] <= _pre[stack[len(stack) - 1]]


def is_operator(val):
    return any([True for op in operators if val == op])


def is_operand(val):
    return val not in operators and val not in '()'


def replace_paren(m):
    if m.group() in '{[':
        return '('
    return ')'


def get_dict(data, Next=False):
    try:
        for ele in data:
            if isinstance(ele, dict):
                if not Next:
                    return ele
                else:
                    Next = False
    except:
        return None


def post_process(data):
    key_to_match = data.keys()[0]
    values = data[key_to_match]
    done = False
    inner_dict = get_dict(values)
    while inner_dict and not done:
        done = True
        if key_to_match == inner_dict.keys()[0]:
            values.remove(inner_dict)
            values = data[key_to_match] = inner_dict.values()[0] + values
            done = False
            inner_dict = get_dict(values)

    for val in values:
        if isinstance(val, dict):
            post_process(val)

def get_modifier(results):
    retval = default_comma_op
    for ele in results:
        if ele in operators:
            retval = ele
    return retval

def comma_fix(prereq, comma_result):
    results = comma_fix_re.findall(prereq)
    results.reverse()
    results = [re.escape(result) for result in results]
    while len(comma_result):
        val = comma_result[0]
        prereq = re.sub(val, val[:-2] + get_modifier(results[:results.index(val)]), prereq, 1)
        comma_result.pop(0)
    return prereq

def pre_process(prereq, mod):
    if restricted_re.findall(prereq):
        return None
    prereq = paren_re.sub(replace_paren, prereq)
    prereq = slash_re.sub(' or ', prereq)
    prereq = colon_re.sub(' and ', prereq)
    prereq = and_re.sub(' and ', prereq)
    prereq = re.sub(mod, "", prereq)
    prereq = re.sub("MUT ", "MUT", prereq)
    prereq = re.sub("CE ", "CE", prereq)
    prereq = re.sub("ME ", "ME", prereq)
    prereq = re.sub("MUA ", "MUA", prereq)
    prereq = re.sub("or its equivalent", "", prereq)
    comma_result = [re.escape(result) for result in comma_re.findall(prereq)]
    if len(comma_result):
        prereq = comma_fix(prereq, comma_result)
    return prereq


def get_interpreted_result(prereq):
    stack = []
    result = []
    mod_re_results = mod_re.findall(prereq)

    dirty_last = False
    i = 0
    while i < len(mod_re_results):
        val = mod_re_results[i]
        #not (verify_re.match(val) and val not in data) and
        if not dirty_last:
            dirty_last = False
            if is_operand(val):
                result += [val]
            elif val == '(':
                stack.append(val)
            elif val == ')':
                while len(stack) and stack[len(stack) - 1] != '(':
                    result.append(stack.pop())
                if len(stack):
                    stack.pop()
            elif i and i < len(mod_re_results) - 1 and not is_operator(mod_re_results[i - 1]) \
                and not is_operator(mod_re_results[i + 1]) and mod_re_results[i + 1] != ')':
                if not len(stack) or stack[len(stack) - 1] == '(':
                    stack.append(val)
                else:
                    while len(stack) and stack[len(stack) - 1] != '(' and precedence(val, stack):
                        result.append(stack.pop())
                    stack.append(val)
            else:
                mod_re_results.pop(i)
                i -= 1
        else:
            dirty_last = (dirty_last == False)
        i += 1
    while len(stack):
        result.append(stack.pop())
    return result


def eval_result(interpreted_result):
    stack = []
    for val in interpreted_result:
        if is_operand(val):
            stack.append(val)
        elif len(stack):
            a = stack.pop()
            try:
                b = stack.pop()
                stack.append({val: [b, a]})
            except:
                stack.append(a)

    if len(stack):
        return stack.pop()
    return None


def no_mod(result):
    for val in result:
        if verify_re.match(val):
            return False
    return True


def get_prereq(prereq, mod):
    # Copy of Prereq
    orignal_prereq = '' + prereq
    if prereq in exceptions:
        return exceptions[prereq]

    prereq = pre_process(prereq, mod)

    if not prereq:
        return orignal_prereq
    interpreted_result = get_interpreted_result(prereq)

    if not interpreted_result or no_mod(interpreted_result):
        return orignal_prereq
    evaluated_result = eval_result(interpreted_result)
    if isinstance(evaluated_result, dict) and len(evaluated_result.keys()):
        post_process(evaluated_result)

    return evaluated_result


preclusion_exceptions = {
    "XX3311": [
        "CM3311",
        "LSM3311",
        "MA3311",
        "PC3311",
        "QF3311",
        "ST3311",
        "ZB3311"
    ],
    "XX3312": [
        "QF3312",
        "PC3312",
        "CM3312",
        "MA3312",
        "ST3312",
        "PR3312"
    ]
}

manual_preclusions = {
    "CG1101": ["CS1010", "CS1010E"]
}

def get_preclusions(preclusion, mod):
    preclusions = verify_re.findall(preclusion)
    for key in preclusion_exceptions.keys():
        if key in preclusions:
            preclusions.remove(key)
            preclusions.extend(preclusion_exceptions[key])
    if mod in preclusions:
        preclusions.remove(mod)
    if mod in manual_preclusions:
        preclusions.extend(manual_preclusions[mod])
    preclusions = list(set(preclusions))
    return preclusions if len(preclusions) != 0 else preclusion

