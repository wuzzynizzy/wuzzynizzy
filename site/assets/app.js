/* nizzy.github.io
   Two small things: the constellation widget, and real stats from the GitHub API. */

const STAR_ICON =
  '<svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 1.6l2.6 7.1 7.5.2-6 4.5 2.2 7.2-6.3-4.1-6.3 4.1 2.2-7.2-6-4.5 7.5-.2z"/></svg>';

/* ---------- constellation ---------- */

const ORDER = ['Imai', 'Acrux', 'Mimosa', 'Ginan', 'Gacrux'];
const buttons = Array.from(document.querySelectorAll('.star'));
const status = document.getElementById('star-status');
const resetButton = document.getElementById('star-reset');
const constellation = document.querySelector('.constellation');

let progress = 0;

buttons.forEach((button) => {
  const icon = document.createElement('span');
  icon.innerHTML = STAR_ICON;
  button.prepend(icon.firstChild);
  button.setAttribute('aria-pressed', 'false');
});

function say(text, tone) {
  status.textContent = text;
  if (tone) {
    status.dataset.tone = tone;
  } else {
    delete status.dataset.tone;
  }
}

function reset(announce) {
  progress = 0;
  buttons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
  constellation.dataset.done = 'false';
  if (announce) say('Back to Imai. Nothing is marked.');
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.star;
    const step = button.dataset.step;

    if (name !== ORDER[progress]) {
      reset(false);
      say(`That barrier thing. ${name} first is out of order, so nothing is marked. Start at Imai.`, 'bad');
      return;
    }

    button.setAttribute('aria-pressed', 'true');
    progress += 1;

    if (progress === ORDER.length) {
      constellation.dataset.done = 'true';
      say('That is the loop: spec, plan, build, check, ship. Gacrux is the ship.', 'good');
    } else {
      say(`${step} done. Next star is ${ORDER[progress]}.`, 'good');
    }
  });
});

resetButton.addEventListener('click', () => reset(true));

/* ---------- github stats ---------- */

const API = 'https://api.github.com/users/wuzzynizzy';
const REPOS = `${API}/repos?sort=pushed&per_page=100`;
const shell = document.getElementById('stats-shell');
const message = document.getElementById('stats-message');
const tiles = document.getElementById('stats');
const recent = document.getElementById('recent');
const checkedAt = document.getElementById('checked-at');
const refresh = document.getElementById('refresh');

const nf = new Intl.NumberFormat();
let inFlight = null;

function setMessage(text, tone) {
  message.textContent = text;
  message.hidden = text === '';
  if (tone) {
    message.dataset.tone = tone;
  } else {
    delete message.dataset.tone;
  }
}

function formatDate(iso) {
  if (!iso) return 'unknown';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function loadStats() {
  if (inFlight) inFlight.abort();
  inFlight = new AbortController();
  const { signal } = inFlight;

  shell.setAttribute('aria-busy', 'true');
  refresh.disabled = true;
  tiles.hidden = true;
  recent.hidden = true;
  setMessage('asking github…');

  try {
    const [userResponse, repoResponse] = await Promise.all([
      fetch(API, { signal, headers: { Accept: 'application/vnd.github+json' } }),
      fetch(REPOS, { signal, headers: { Accept: 'application/vnd.github+json' } }),
    ]);

    if (userResponse.status === 404) throw new Error('The account lookup came back empty. That should not happen.');
    if (userResponse.status === 403 || repoResponse.status === 403) {
      throw new Error('GitHub is rate limiting anonymous requests right now. Try the button again in a minute.');
    }
    if (!userResponse.ok || !repoResponse.ok) {
      throw new Error(`GitHub answered ${userResponse.status}/${repoResponse.status} instead of sending data.`);
    }

    const user = await userResponse.json();
    const repos = await repoResponse.json();
    if (!Array.isArray(repos)) throw new Error('The repo list came back in a shape I did not expect.');

    const stars = repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);

    document.getElementById('stat-repos').textContent = nf.format(user.public_repos ?? repos.length);
    document.getElementById('stat-followers').textContent = nf.format(user.followers ?? 0);
    document.getElementById('stat-stars').textContent = nf.format(stars);
    document.getElementById('stat-since').textContent = formatDate(user.created_at);
    tiles.hidden = false;

    const top = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 4);

    recent.replaceChildren();
    if (top.length === 0) {
      setMessage('No public repos yet. That will change.');
    } else {
      top.forEach((repo) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'repo-name';
        link.href = repo.html_url;
        link.textContent = repo.name;
        const meta = document.createElement('span');
        meta.className = 'repo-meta';
        meta.textContent = `${repo.language || 'no language listed'} · pushed ${formatDate(repo.pushed_at)}`;
        item.append(link, meta);
        recent.append(item);
      });
      recent.hidden = false;
      setMessage('');
    }

    checkedAt.textContent = `checked ${new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch (error) {
    if (error.name === 'AbortError') return;
    setMessage(error.message || 'GitHub did not answer. Try the button.', 'bad');
    checkedAt.textContent = '';
  } finally {
    shell.setAttribute('aria-busy', 'false');
    refresh.disabled = false;
  }
}

refresh.addEventListener('click', loadStats);
loadStats();
