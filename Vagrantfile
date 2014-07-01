Vagrant.configure('2') do |config|
  config.vm.box = 'ubuntu/trusty64'

  config.vm.provider 'virtualbox' do |v|
    v.memory = 1024
  end

  config.vm.network 'forwarded_port', guest: 80, host: 8080, auto_correct: true
  config.vm.network 'forwarded_port', guest: 9000, host: 9000, auto_correct: true
  config.vm.network 'forwarded_port', guest: 35729, host: 35729, auto_correct: true
  config.vm.network 'private_network', type: 'dhcp'
  config.ssh.forward_agent = true
  config.vm.synced_folder '.', '/vagrant', disabled: true
  config.vm.synced_folder '.', '/home/vagrant/NUSMods', type: 'nfs'

  config.vm.provision 'ansible' do |ansible|
    ansible.playbook = 'provisioning/vagrant.yml'
    ansible.verbose = 'v'
  end

  if Vagrant.has_plugin?('vagrant-cachier')
    config.cache.scope = :machine
  end
end
