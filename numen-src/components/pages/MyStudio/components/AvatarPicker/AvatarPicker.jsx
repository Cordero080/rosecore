//import './AvatarPicker.scss';

function AvatarPicker({ avatars = [], selected, onSelect }) {
  return (
    <div className="avatar-picker">
      {avatars.map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt={`avatar-${index}`}
          className={`avatar-option ${
            selected === avatar ? 'selected' : ''
          }`}
          onClick={() => onSelect(avatar)}
        />
      ))}
    </div>
  );
}

export default AvatarPicker;

