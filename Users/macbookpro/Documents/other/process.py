things = []
with open('game.txt', 'r') as f:
    lines = f.readlines()
    for line in lines:
        bah = line.split('\t')
        bah.reverse()
        things.append(bah) 

with open('game-result.txt', 'w') as f:
    for thing in things:
        f.write('\t'.join(thing))   
        f.write('\n')