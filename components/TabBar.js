import { HomeIcon, CardsIcon } from './Icons.js';

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'discover', label: 'Discover', Icon: CardsIcon },
];

export default function TabBar({ tab, onChange }) {
  return (
    <nav className="tabbar" role="tablist" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={tab === id}
          className={`tab ${tab === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
