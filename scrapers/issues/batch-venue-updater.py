'''Pulls open venue data update issues from Github, and writes out the updated
venues.js.

Requirements:
- pip install PyGithub
'''

from github import Github
import json


def get_update_proposed(body):
    prefix, suffix = '```json', '```'
    md = body.split('**Update proposed:**')[1].strip()
    if md.startswith(prefix):
        md = md[len(prefix):]
    if md.endswith(suffix):
        md = md[:-len(suffix)]
    return json.loads('{' + md + '}')


if __name__ == '__main__':
    g = Github()
    repo = g.get_repo('nusmodifications/nusmods')

    venues_file = repo.get_file_contents('website/src/data/venues.json')
    venues = json.loads(venues_file.decoded_content)

    issues = repo.get_issues(
        state='open',
        labels=[repo.get_label(name='venue data')],
    )
    issues_to_close = []
    for issue in issues:
        try:
            update_proposed = get_update_proposed(issue.body)
            venues.update(update_proposed)
            issues_to_close.append(issue.number)
        except Exception as e:
            print(f'Error updating #{issue.number}: {repr(e)}')

    for issue_no in issues_to_close:
        print(f'Closes #{issue_no}')

    with open('venues.json', 'w') as fo:
        fo.write(json.dumps(venues, indent=2))
